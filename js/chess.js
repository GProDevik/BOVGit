//v1.0.26 2021-02-09
let urlHttpServiceLichess = 'https://lichess.org/api/user/';
let urlHttpServiceChessCom = 'https://api.chess.com/pub/player/';
let intervalID;
let isFirstChessCom = false, inputNode1, inputNode2, tableNode1, tableNode2;
let mapTimeControl = new Map([
  ['player', 0],
  ['bullet', 1],
  ['blitz', 2],
  ['rapid', 3],
  ['puzzle', 4],
  ['rush', 5]
]);
let sortSymbolAtHead = '↑'; //&#8593
let lastSortSelectorLichess = '', lastSortSelectorChessCom = '';
let lastSortTimeControlLichess = '', lastSortTimeControlChessCom = '';
let isMobileDevice = is_mobile_device();

inputNode1 = document.querySelector('#InputOrder1');
inputNode2 = document.querySelector('#InputOrder2');
tableNode1 = document.querySelector('#TableOrder1');
tableNode2 = document.querySelector('#TableOrder2');

//MobileStyle
if (isMobileDevice) {
  document.querySelector('#bodyStyle').setAttribute("class", "mobileSyle");
  document.querySelector('.projectName').setAttribute("class", "projectName projectNameDifMobile");
}

// ------------- On-Click ---------------
document.querySelector('.projectName').onclick = () => refresh(); //refresh by click on projectName

document.querySelector('#buttonLichessRefresh').onclick = () => refreshLichess(); //refresh Lichess Table by click button
document.querySelector('#buttonChessComRefresh').onclick = () => refreshChessCom(); //refresh ChessCom Table by click button
document.querySelector('#elemCheckLichess').onclick = () => refreshLichess(); //refresh by click on checkBox of Lichess
document.querySelector('#elemCheckChessCom').onclick = () => refreshChessCom(); //refresh by click on checkBox of ChessCom

document.querySelector('.THeadPlayerLichess').onclick = () => refreshLichess(); //refresh by click on 1-st Head of Lichess Table
document.querySelector('.THeadPlayerChessCom').onclick = () => refreshChessCom(); //refresh by click on 1-st Head of ChessCom Table

//sort columns in Lichess
document.querySelector('.THeadbulletLichess').onclick = () => sortBulletLichess();
document.querySelector('.THeadblitzLichess').onclick = () => sortBlitzLichess();
document.querySelector('.THeadrapidLichess').onclick = () => sortRapidLichess();
document.querySelector('.THeadpuzzleLichess').onclick = () => sortPuzzleLichess();
document.querySelector('.THeadrushLichess').onclick = () => sortRushLichess();

//sort columns in Chess.com
document.querySelector('.THeadbulletChessCom').onclick = () => sortBulletChessCom();
document.querySelector('.THeadblitzChessCom').onclick = () => sortBlitzChessCom();
document.querySelector('.THeadrapidChessCom').onclick = () => sortRapidChessCom();
document.querySelector('.THeadpuzzleChessCom').onclick = () => sortPuzzleChessCom();
document.querySelector('.THeadrushChessCom').onclick = () => sortRushChessCom();

document.querySelector('#buttonChangeTables').onclick = () => buttonChangeTablesFunction();

//settings
document.querySelector('#buttonSettings').onclick = () => goSetMode();
document.querySelector('#elemCheckDarkTheme').onclick = () => setTheme();
document.querySelector('#buttonClearSettings').onclick = () => clearSettings();
document.querySelector('#buttonReturnToMain').onclick = () => goMainMode();

//hot keys
document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    refresh();
  }
});

getDataFromStorage();

//set first chess.com
if (isFirstChessCom) {
  changeTablesOrder();
}

refresh();

setAutoRefresh();

setTheme();

replaceSomeHeads();
window.addEventListener("orientationchange", function () {
  replaceSomeHeads(window.orientation);
}, false);

/////////////////////////////////////////////////////////////////////////////

//replace some heads for 'mobile portrait'
function replaceSomeHeads(windowOrientation) {
  let b, p, useLongWords = false;
  if (windowOrientation === undefined) {
    const mediaQuery = window.matchMedia('(orientation: landscape)');
    useLongWords = !isMobileDevice || mediaQuery.matches; //PC or landscape
  } else {
    useLongWords = (windowOrientation === 90 || windowOrientation === -90); //landscape
  }

  if (useLongWords) {
    //for PC or landscape
    b = 'bullet';
    p = 'puzzle';
  } else {
    //for mobile portrait
    b = 'bull';
    p = 'puzl';
  }

  document.querySelector('.THeadbulletLichess').textContent = b;
  document.querySelector('.THeadpuzzleLichess').textContent = p;
  document.querySelector('.THeadbulletChessCom').textContent = b;
  document.querySelector('.THeadpuzzleChessCom').textContent = p;
}

//sort Bullet in Lichess Table
function sortBulletLichess() {
  const thisIsLichess = true;
  const timeControl = 'bullet';
  sortTable(thisIsLichess, timeControl);
}
//sort Blitz in Lichess Table
function sortBlitzLichess() {
  const thisIsLichess = true;
  const timeControl = 'blitz';
  sortTable(thisIsLichess, timeControl);
}
//sort Rapid in Lichess Table
function sortRapidLichess() {
  const thisIsLichess = true;
  const timeControl = 'rapid';
  sortTable(thisIsLichess, timeControl);
}
//sort Puzzle in Lichess Table
function sortPuzzleLichess() {
  const thisIsLichess = true;
  const timeControl = 'puzzle';
  sortTable(thisIsLichess, timeControl);
}
//sort Rush in Lichess Table
function sortRushLichess() {
  const thisIsLichess = true;
  const timeControl = 'rush';
  sortTable(thisIsLichess, timeControl);
}

//sort Bullet in ChessCom Table
function sortBulletChessCom() {
  const thisIsLichess = false;
  const timeControl = 'bullet';
  sortTable(thisIsLichess, timeControl);
}
//sort Blitz in ChessCom Table
function sortBlitzChessCom() {
  const thisIsLichess = false;
  const timeControl = 'blitz';
  sortTable(thisIsLichess, timeControl);
}
//sort Rapid in ChessCom Table
function sortRapidChessCom() {
  const thisIsLichess = false;
  const timeControl = 'rapid';
  sortTable(thisIsLichess, timeControl);
}
//sort Puzzle in ChessCom Table
function sortPuzzleChessCom() {
  const thisIsLichess = false;
  const timeControl = 'puzzle';
  sortTable(thisIsLichess, timeControl);
}
//sort Rush in ChessCom Table
function sortRushChessCom() {
  const thisIsLichess = false;
  const timeControl = 'rush';
  sortTable(thisIsLichess, timeControl);
}

//sort columns ('bullet', 'blitz', 'rapid', 'puzzle', 'rush') in Table
function sortTable(thisIsLichess, timeControl) {

  if (timeControl === '') {
    return;
  }

  let tableRef = getChessTableRef(thisIsLichess);
  let r, rowCount = tableRef.rows.length;
  let c, cellcount, cells;
  let s, n, selector, lastSymbol;

  if (rowCount === 0) {
    return;
  }

  let a = new Array(rowCount);

  //fill array from table
  for (r = 0; r < rowCount; r++) {
    cells = tableRef.rows[r].cells;
    cellcount = cells.length;
    a[r] = new Array(cellcount);
    for (c = 0; c < cellcount; c++) {
      s = (c === 0) ? cells[c].innerHTML : cells[c].textContent;
      s = s.trim(); //cell value

      //playerName
      if (c === 0) a[r][c] = s;

      //bullet, blitz, rapid, puzzle, rush ---> to number
      else {
        n = 0;
        if (s !== '') {
          n = parseInt(s, 10);
          if (isNaN(n) || !(Number.isInteger(n))) {
            n = 0;
          }
        }
        a[r][c] = n;
      }
    }
  }

  //sort array in column <timeControl>
  a.sort(function (x, y) {
    let i = mapTimeControl.get(timeControl); // i=1 - bullet, i=2 - blitz, ...
    // return x[i] - y[i]; //asc
    return y[i] - x[i]; //desc
  })

  //delete sortSymbolAtHead from previous sorted column
  delSortSymbolAtHeadFromPreviousSortedColumn(thisIsLichess);

  // <th class='THeadbulletLichess'>Bullet</th>
  // <th class='THeadbulletChessCom'>Bullet</th>
  selector = '.THead' + timeControl + (thisIsLichess ? 'Lichess' : 'ChessCom');

  //to place sortSymbolAtHead after head of sorted column
  s = document.querySelector(selector).textContent;
  lastSymbol = s.slice(-1);
  if (lastSymbol !== sortSymbolAtHead) {
    document.querySelector(selector).textContent += sortSymbolAtHead;
  }

  //set lastSortSelector
  if (thisIsLichess) {
    lastSortSelectorLichess = selector;
    lastSortTimeControlLichess = timeControl;
  } else {
    lastSortSelectorChessCom = selector;
    lastSortTimeControlChessCom = timeControl;
  }

  //fill table from array
  const pref = thisIsLichess ? '.l' : '.c';
  for (r = 0; r < rowCount; r++) {
    const rowNum = r + 1;
    document.querySelector(pref + 'player' + rowNum).innerHTML = a[r][0]; //innerHTML (because 'href')
    document.querySelector(pref + 'bullet' + rowNum).textContent = a[r][1] === 0 ? '' : a[r][1];
    document.querySelector(pref + 'blitz' + rowNum).textContent = a[r][2] === 0 ? '' : a[r][2];
    document.querySelector(pref + 'rapid' + rowNum).textContent = a[r][3] === 0 ? '' : a[r][3];
    document.querySelector(pref + 'puzzle' + rowNum).textContent = (a[r][4] === 0 ? '' : a[r][4]);
    document.querySelector(pref + 'rush' + rowNum).textContent = (a[r][5] === 0 ? '' : a[r][5]);
  }
}

//delete sortSymbolAtHead from previous sorted column
function delSortSymbolAtHeadFromPreviousSortedColumn(thisIsLichess) {
  let selectorPrev = thisIsLichess ? lastSortSelectorLichess : lastSortSelectorChessCom;
  if (selectorPrev !== '') {
    let s = document.querySelector(selectorPrev).textContent;
    let lastSymbol = s.slice(-1);
    if (lastSymbol === sortSymbolAtHead) {
      document.querySelector(selectorPrev).textContent = s.slice(0, -1);
    }
  }
}

function clearLastSort(thisIsLichess) {
  delSortSymbolAtHeadFromPreviousSortedColumn(thisIsLichess);

  if (thisIsLichess) {
    lastSortSelectorLichess = '';
    lastSortTimeControlLichess = '';
  } else {
    lastSortSelectorChessCom = '';
    lastSortTimeControlChessCom = '';
  }
}

/////////////////////////////////////////////////////////////////////////////

//refresh all tables
function refresh() {
  clearAllTables();

  refreshOneTable(true);
  if (lastSortTimeControlLichess !== '') {
    setTimeout(function () { sortTable(true, lastSortTimeControlLichess) }, 1000); //execute in N ms
  }

  refreshOneTable(false);
  if (lastSortTimeControlChessCom !== '') {
    setTimeout(function () { sortTable(false, lastSortTimeControlChessCom) }, 5000); //execute in N ms
  }

  setDataToStorage();
  setAutoRefresh();
}

function refreshLichess() {
  const thisIsLichess = true;
  refreshOne(thisIsLichess);
}

function refreshChessCom() {
  const thisIsLichess = false;
  refreshOne(thisIsLichess);
}

function refreshOne(thisIsLichess) {
  clearTable(thisIsLichess);
  clearLastSort(thisIsLichess);
  refreshOneTable(thisIsLichess);
  setDataToStorage();
}

function refreshOneTable(thisIsLichess) {
  replaceSomeHeads();

  let selectorTable = thisIsLichess ? '.TableLichess' : '.TableChessCom';
  let selectorCheck = thisIsLichess ? 'elemCheckLichess' : 'elemCheckChessCom';
  let elem = document.querySelector(selectorTable);
  if (document.getElementById(selectorCheck).checked) {
    if (elem.style.display !== 'block') {
      elem.style.display = 'block'; //table is visible
    }
    clearTable(thisIsLichess);
    fillTableFromServer(thisIsLichess);
  } else {
    if (elem.style.display !== 'none') {
      elem.style.display = 'none'; //table is non-visible
    }
  }
}

function clearAllTables() {
  clearTable(true);
  clearTable(false);
}

function clearTable(thisIsLichess) {
  const pref = thisIsLichess ? '.l' : '.c';
  const n = getTableRowsNumber(thisIsLichess);
  for (let step = 0; step < n; step++) {
    const rowNum = step + 1;
    document.querySelector(pref + 'player' + rowNum).innerHTML = ''; //innerHTML (because 'href')
    document.querySelector(pref + 'bullet' + rowNum).textContent = '';
    document.querySelector(pref + 'blitz' + rowNum).textContent = '';
    document.querySelector(pref + 'rapid' + rowNum).textContent = '';
    document.querySelector(pref + 'puzzle' + rowNum).textContent = '';
    document.querySelector(pref + 'rush' + rowNum).textContent = '';
  }
}

//clear all cells at row (exception: Player)
function clearRow(thisIsLichess, rowNum) {
  const pref = thisIsLichess ? '.l' : '.c';
  document.querySelector(pref + 'bullet' + rowNum).textContent = '';
  document.querySelector(pref + 'blitz' + rowNum).textContent = '';
  document.querySelector(pref + 'rapid' + rowNum).textContent = '';
  document.querySelector(pref + 'puzzle' + rowNum).textContent = '';
  document.querySelector(pref + 'rush' + rowNum).textContent = '';
}

function clearRowLichess(rowNum) {
  const thisIsLichess = true;
  clearRow(thisIsLichess, rowNum);
}

function clearRowChessCom(rowNum) {
  const thisIsLichess = false;
  clearRow(thisIsLichess, rowNum);
}

function fillTableFromServer(thisIsLichess) {
  let elem, playerNames, arPlayerNames, rowNum;
  elem = getElementInputPlayers(thisIsLichess);
  playerNames = elem.value.trim(); //delete begin and end spaces
  arPlayerNames = playerNames.split(' '); //get array of Players names
  rowNum = 0;
  for (let step = 0; step < arPlayerNames.length; step++) {
    const playerName = arPlayerNames[step];
    if (playerName !== '') {
      if (++rowNum > getTableRowsNumber(thisIsLichess)) {
        addRowToTable(thisIsLichess, rowNum);
      }
      fetchTable(thisIsLichess, rowNum, playerName);
    }
  }
  //delete unnecessary last rows (if number of players less than number of rows)
  for (let j = 0; j < 100; j++) {
    if (rowNum++ >= getTableRowsNumber(thisIsLichess)) {
      break;
    }
    deleteLastRowFromTable(thisIsLichess);
  }
}

function getElementInputPlayers(thisIsLichess) {
  const elem = thisIsLichess ? document.getElementById('elemTextLichessOrgPlayerNames') :
    document.getElementById('elemTextChessComPlayerNames');
  return elem;
}

function fetchTable(thisIsLichess, rowNum, playerName) {
  thisIsLichess ? fetchGetLichessOrg(rowNum, playerName) :
    fetchGetChessCom(rowNum, playerName);
}

function getTableRowsNumber(thisIsLichess) {
  const tableRef = getChessTableRef(thisIsLichess);
  return tableRef.rows.length;
}

function getChessTableRef(thisIsLichess) {
  const tableName = thisIsLichess ? '.TBodyLichess' : '.TBodyChessCom';
  const tableRef = document.querySelector(tableName);
  return tableRef;
}

function deleteLastRowFromTable(thisIsLichess) {
  const tableRef = getChessTableRef(thisIsLichess);
  tableRef.deleteRow(-1);
}

function addRowToTable(thisIsLichess, rowNum) {

  let atrClass;
  const letter = thisIsLichess ? 'l' : 'c';

  //create DOM-elements
  const tableRef = getChessTableRef(thisIsLichess);
  //const trRef = document.createElement('tr');
  const trRef = tableRef.insertRow();

  //player
  const textPlayerRef = document.createTextNode('player' + rowNum);
  const thRef = document.createElement('th');
  thRef.setAttribute('scope', 'row');
  atrClass = letter + 'player' + rowNum;
  thRef.setAttribute('class', atrClass);

  //bullet
  const tdBulletRef = document.createElement('td');
  atrClass = letter + 'bullet' + rowNum;
  tdBulletRef.setAttribute('class', atrClass);

  //blitz
  const tdBlitzRef = document.createElement('td');
  atrClass = letter + 'blitz' + rowNum;
  tdBlitzRef.setAttribute('class', atrClass);

  //rapid
  const tdRapidRef = document.createElement('td');
  atrClass = letter + 'rapid' + rowNum;
  tdRapidRef.setAttribute('class', atrClass);

  //puzzle
  const tdPuzzleRef = document.createElement('td');
  atrClass = letter + 'puzzle' + rowNum;
  tdPuzzleRef.setAttribute('class', atrClass);

  //rush
  const tdRushRef = document.createElement('td');
  atrClass = letter + 'rush' + rowNum;
  tdRushRef.setAttribute('class', atrClass);

  //new DOM-elements join to elements on HTML-page
  tableRef.appendChild(trRef);
  trRef.appendChild(thRef);
  thRef.appendChild(textPlayerRef);
  trRef.appendChild(tdBulletRef);
  trRef.appendChild(tdBlitzRef);
  trRef.appendChild(tdRapidRef);
  trRef.appendChild(tdPuzzleRef);
  trRef.appendChild(tdRushRef);
}

//------------------------------------------------------
//fill table's row for player on Lichess.org
async function fetchGetLichessOrg(rowNum, playerName) {

  clearRowLichess(rowNum);

  const url = urlHttpServiceLichess + playerName;
  const response = await fetch(url);
  if (response.ok) { // HTTP-state in 200-299
    const jsonObj = await response.json(); // read answer in JSON

    const isOnline = getJsonValue1(playerName, jsonObj, 'online');
    const onlineSymbol = isOnline ? getOnlineSymbol() + ' ' : '';

    //title (GM, IM, FM, ...)
    let title = getJsonValue1(playerName, jsonObj, 'title');
    title = (title === undefined) ? '' : title + ' ';

    //player (href !)
    const playerURL = getJsonValue1(playerName, jsonObj, 'url');
    document.querySelector('.lplayer' + rowNum).innerHTML = '<a href="' + playerURL + '">' + onlineSymbol + title + playerName + '</a>';

    //bullet
    document.querySelector('.lbullet' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'perfs', 'bullet', 'rating');
    //blitz
    document.querySelector('.lblitz' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'perfs', 'blitz', 'rating');
    //rapid
    document.querySelector('.lrapid' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'perfs', 'rapid', 'rating');
    //puzzle
    document.querySelector('.lpuzzle' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'perfs', 'puzzle', 'rating');
    //rush (max)
    document.querySelector('.lrush' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'perfs', 'storm', 'score');

  } else {
    console.log(playerName + ' - lichess, response-error: ' + response.status);
    //player not found
    document.querySelector('.lplayer' + rowNum).innerHTML = '? ' + playerName;
  };
}

//------------------------------------------------------
//fill table's row for player on Chess.com
async function fetchGetChessCom(rowNum, playerName) {

  let url, response, cell, last_online;
  let playerURL = '', onlineSymbol = '', title = '';

  clearRowChessCom(rowNum);

  //is-online
  url = urlHttpServiceChessCom + playerName + '/is-online';
  try {
    response = await fetch(url);
    if (response.ok) { // HTTP-state in 200-299
      let jsonObj = await response.json(); // read answer in JSON
      let isOnline = getJsonValue1(playerName, jsonObj, 'online');
      onlineSymbol = isOnline ? getOnlineSymbol() + ' ' : '';
    } else {
      console.log(playerName + ' - chess.com, is-online, response-error: ' + response.status);
    };
  } catch (err) {
    console.log(playerName + ' - chess.com, is-online, fetch-error: ' + err);
  }

  //player, playerURL
  url = urlHttpServiceChessCom + playerName;
  try {
    response = await fetch(url);
    if (response.ok) { // HTTP-state in 200-299
      let jsonObj = await response.json(); // read answer in JSON
      playerURL = getJsonValue1(playerName, jsonObj, 'url');
      //title (GM, IM, FM, ...)
      title = getJsonValue1(playerName, jsonObj, 'title');
      title = (title === undefined) ? '' : title + ' ';
    } else {
      console.log(playerName + ' - chess.com, playerURL, response-error: ' + response.status);
    };
  } catch (err) {
    console.log(playerName + ' - chess.com, playerURL, fetch-error: ' + err);
  } finally {
    //player
    cell = document.querySelector('.cplayer' + rowNum);
    if (playerURL === ''
      || playerURL === undefined) {
      cell.innerHTML = '? ' + playerName; //player not found
    }
    else {
      cell.innerHTML = '<a href="' + playerURL + '">' + onlineSymbol + title + playerName + '</a>';
    }
  }

  //blitz, bullet, rapid, puzzle, rush
  url = urlHttpServiceChessCom + playerName + '/stats';
  response = await fetch(url);
  if (response.ok) { // HTTP-state in 200-299
    let jsonObj = await response.json(); // read answer in JSON
    //bullet
    document.querySelector('.cbullet' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'chess_bullet', 'last', 'rating');
    //blitz
    document.querySelector('.cblitz' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'chess_blitz', 'last', 'rating');
    //rapid
    document.querySelector('.crapid' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'chess_rapid', 'last', 'rating');
    //puzzle (max)
    document.querySelector('.cpuzzle' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'tactics', 'highest', 'rating');
    //rush
    document.querySelector('.crush' + rowNum).textContent = getJsonValue3(playerName, jsonObj, 'puzzle_rush', 'best', 'score');
  } else {
    console.log(playerName + ' - chess.com, bullet...rush, fetch-error: ' + response.status);
  };
}

function getJsonValue1(playerName, jsonObj, field1) {
  let value = '';
  try {
    value = jsonObj[field1];
  }
  catch (err) {
    console.log('Error in getJsonValue1(): playerName=' + playerName + ' ' + field1 + ': ' + err);
  }
  return value;
}

function getJsonValue3(playerName, jsonObj, field1, field2, field3) {
  let value = '';
  try {
    value = jsonObj[field1][field2][field3];
  }
  catch (err) {
    console.log('Error in getJsonValue3(): playerName=' + playerName + ' ' + field1 + '.' + field2 + '.' + field3 + ': ' + err);
  }
  return value;
}

function getOnlineSymbol() {
  return '&#10004;'; //check
}

///////////////////////////////////////////////////////////

function goSetMode() {
  document.querySelector('main').style.display = 'none'; //section is non-visible
  document.querySelector('.sectionSettingsArea').style.display = 'block'; //section is visible
}

function goMainMode() {

  //AutoRefreshInterval is correct ?
  let s = document.getElementById('elemAutoRefreshInterval').value.trim();
  if (s !== '') {
    let n = parseInt(s, 10);
    if (isNaN(n) || !(Number.isInteger(n) && n >= 0 && n <= 9999)) {
      alert('Interval must be between 0 and 9999 !');
      return; //AutoRefreshInterval is not correct
    }
    s = n.toString(10);
  }
  document.getElementById('elemAutoRefreshInterval').value = s; //correct
  localStorage.setItem('AutoRefreshInterval', s);
  setAutoRefresh();

  document.querySelector('.sectionSettingsArea').style.display = 'none'; //section is non-visible
  document.querySelector('main').style.display = 'block'; //section is visible
}

function buttonChangeTablesFunction() {
  changeTablesOrder();
  setFirstChessComToStorage();
}

//////////////////////////////////////////////////////////

function getDataFromStorage() {
  let playerNames = localStorage.getItem('LichessOrgPlayerNames');
  if (playerNames !== '') {
    document.getElementById('elemTextLichessOrgPlayerNames').value = playerNames;
  }

  playerNames = localStorage.getItem('ChessComPlayerNames');
  if (playerNames !== '') {
    document.getElementById('elemTextChessComPlayerNames').value = playerNames;
  }

  let v = localStorage.getItem('LichessChecked');
  document.getElementById('elemCheckLichess').checked = (v === '1' ? true : false);

  v = localStorage.getItem('ChessComChecked');
  document.getElementById('elemCheckChessCom').checked = (v === '1' ? true : false);

  v = localStorage.getItem('isFirstChessCom');
  isFirstChessCom = (v === '1' ? true : false);

  v = localStorage.getItem('AutoRefreshInterval');
  document.getElementById('elemAutoRefreshInterval').value = v;

  v = localStorage.getItem('DarkThemeChecked');
  document.getElementById('elemCheckDarkTheme').checked = (v === '1' ? true : false);
}

function setDataToStorage() {
  let playerNames = document.getElementById('elemTextLichessOrgPlayerNames').value;
  localStorage.setItem('LichessOrgPlayerNames', playerNames);

  playerNames = document.getElementById('elemTextChessComPlayerNames').value;
  localStorage.setItem('ChessComPlayerNames', playerNames);

  let v = document.getElementById('elemCheckLichess').checked ? '1' : '0';
  localStorage.setItem('LichessChecked', v);

  v = document.getElementById('elemCheckChessCom').checked ? '1' : '0';
  localStorage.setItem('ChessComChecked', v);
}

function setFirstChessComToStorage() {
  isFirstChessCom = !isFirstChessCom;
  const v = (isFirstChessCom ? '1' : '');
  localStorage.setItem('isFirstChessCom', v);
}

function clearSettings() {
  localStorage.clear();

  document.getElementById('elemAutoRefreshInterval').value = "";
  document.getElementById('elemCheckDarkTheme').checked = false;
  document.getElementById('elemTextLichessOrgPlayerNames').value = "";
  document.getElementById('elemTextChessComPlayerNames').value = "";

  if (isFirstChessCom) {
    isFirstChessCom = false;
    changeTablesOrder();
  }

  refresh();
  setAutoRefresh();
  setTheme();

  alert('All settings are cleared.');
}

///////////////////////////////////////////////////////////

function setAutoRefresh() {
  clearInterval(intervalID);
  let s = document.getElementById('elemAutoRefreshInterval').value.trim();
  if (s !== '') {
    let n = parseInt(s, 10);
    if (n !== 0) {
      let milliSeconds = n * 60 * 1000;
      intervalID = setInterval(refresh, milliSeconds);
    }
  } else {
    intervalID = undefined;
  }
}

function changeTablesOrder() {
  let t;

  inputNode2.parentNode.insertBefore(inputNode2, inputNode1);
  t = inputNode1;
  inputNode1 = inputNode2;
  inputNode2 = t;

  tableNode2.parentNode.insertBefore(tableNode2, tableNode1);
  t = tableNode1;
  tableNode1 = tableNode2;
  tableNode2 = t;
}

///////////////////////////////////////////////////////////

function setTheme() {
  const isDarkTheme = document.getElementById('elemCheckDarkTheme').checked;

  const black = 'black';
  const white = 'white';
  if (isDarkTheme) {
    document.body.style.backgroundColor = black;
    document.body.style.color = white;
  } else {
    document.body.style.backgroundColor = white;
    document.body.style.color = black;
  }

  const v = isDarkTheme ? '1' : '0';
  localStorage.setItem('DarkThemeChecked', v);
}

function is_mobile_device() {
  const s = 'ipad|iphone|android|pocket|palm|windows ce|windowsce|cellphone|opera mobi|'
    + 'ipod|small|sharp|sonyericsson|symbian|opera mini|nokia|htc_|samsung|motorola|smartphone|'
    + 'blackberry|playstation portable|tablet browser|webOS|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk';
  const devices = new RegExp(s, "i");
  return devices.test(navigator.userAgent) ? true : false;
}

//get date & time in: YYYY-MM-DD HH:MM:SS
function getDateTime(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1; //'+1', because return: from 0 to 11
  let dayOfMonth = date.getDate();
  let hour = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  //formatting
  //year = year.toString().slice(-2); //year in 2 digit
  year = year.toString();
  month = month < 10 ? '0' + month : month;
  dayOfMonth = dayOfMonth < 10 ? '0' + dayOfMonth : dayOfMonth;
  hour = hour < 10 ? '0' + hour : hour;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return `${year}-${month}-${dayOfMonth} ${hour}:${minutes}:${seconds}`
}

//get date in: YYYY-MM-DD
function getDateYYYYMMDD(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1; //'+1', because return: from 0 to 11
  let dayOfMonth = date.getDate();

  //formatting
  //year = year.toString().slice(-2); //year in 2 digit
  year = year.toString();
  month = month < 10 ? '0' + month : month;
  dayOfMonth = dayOfMonth < 10 ? '0' + dayOfMonth : dayOfMonth;

  return `${year}-${month}-${dayOfMonth}`
}

//авторизация: на будущее

// exchange data with server (Login, Logout, Registration, ...):
// 1) by AJAX
// 2) by reload page (form, submit)

//login
document.querySelector('#buttonPostRegistration').onclick = () => postRegistration()
document.querySelector('#buttonPostLogin').onclick = () => postLogin()
document.querySelector('#buttonPostLogout').onclick = () => postLogout()

function processUrlParams() {
  const urlParams = new URLSearchParams(window.location.search)
  let v, v1, v2, v3, v4, v5, v6, v7, err

  v1 = urlParams.get('afterSendUserSettingsToServer')
  if (v1) {
    v = localStorage.getItem('username')
    v1 = localStorage.getItem('regtype')
    if (v) {
      setUsernameAndRegtype(v, v1)
    }
    return
  }

  //show errorMsgAfterRegistration
  err = urlParams.get('errorMsgAfterRegistration')
  if (err) {
    setUsernameAndRegtype('', '')
    alert('errorMsgAfterRegistration: ' + err)
    return
  }

  //usernameAfterRegistration
  const user = urlParams.get('usernameAfterRegistration')
  if (user) {
    const pass = urlParams.get('passwordAfterRegistration')
    if (pass) {
      alert('User <' + user + '> registered.') //delay
      postUserAction('/login', user, pass)
    }
    else {
      alert('Impossible to login after registration (password is empty).')
    }
    return
  }

  //show errorMsgAfterLogin
  err = urlParams.get('errorMsgAfterLogin')
  if (err) {
    alert('errorMsgAfterLogin: ' + err)
    return
  }

  //usernameAfterLogin, ...AfterLogin
  v = urlParams.get('usernameAfterLogin')
  if (v) {
    v1 = urlParams.get('regtypeAfterLogin')
    setUsernameAndRegtype(v, v1)
    localStorage.setItem('username', username)
    localStorage.setItem('regtype', regtype)

    //PlayerNamesAfterLogin, isDarkThemeAfterLogin, ...AfterLogin
    v1 = urlParams.get('LichessOrgPlayerNamesAfterLogin')
    if (v1) {
      setLichessOrgPlayerNames(v1)
      localStorage.setItem('LichessOrgPlayerNames', v1)
    }

    v2 = urlParams.get('ChessComPlayerNamesAfterLogin')
    if (v2) {
      setChessComPlayerNames(v2)
      localStorage.setItem('ChessComPlayerNames', v2)
    }

    v3 = false
    v = urlParams.get('isDarkThemeAfterLogin')
    if (v) {
      v3 = (v === '1' ? true : false)
      setCheckDarkTheme(v3)
      localStorage.setItem('DarkThemeChecked', v3 ? '1' : '0')
      setTheme()
    }

    v4 = false
    v = urlParams.get('CheckLichessAfterLogin')
    if (v) {
      v4 = (v === '1' ? true : false)
      setCheckLichess(v4)
      localStorage.setItem('LichessChecked', v4 ? '1' : '0')
    }

    v5 = false
    v = urlParams.get('CheckChessComAfterLogin')
    if (v) {
      v5 = (v === '1' ? true : false)
      setCheckChessCom(v5)
      localStorage.setItem('ChessComChecked', v5 ? '1' : '0')
    }

    v6 = false
    v = urlParams.get('isFirstChessComAfterLogin')
    if (v) {
      v6 = (v === '1' ? true : false)
      if (v6 !== isFirstChessCom) {
        isFirstChessCom = v6
        changeTablesOrder()
      }
      localStorage.setItem('isFirstChessCom', v6 ? '1' : '0')
    }

    v7 = urlParams.get('autoRefreshIntervalAfterLogin')
    if (v7) {
      setAutoRefreshInterval(v7)
      localStorage.setItem('AutoRefreshInterval', v7)
    }

    if (v1 || v2 || v3 || v4 || v5 || v6) {
      refresh()
      needRefresh = false
    }
    return
  }

  //usernameAfterLogout
  v = urlParams.get('usernameAfterLogout')
  if (v) {
    setUsernameAndRegtype('', '')
    localStorage.setItem('username', '') //localSession finished
    localStorage.setItem('regtype', '')
    return
  }

  // //if username already was in localStorage and PageAlreadyWasVisitedAtSession, then suggest to login
  // v = localStorage.getItem('username')
  // if (v) {
  //   v1 = 'PageAlreadyWasVisitedAtThisBrowserTab'
  //   v2 = sessionStorage.getItem(v1)
  //   v2 ? goUserMode() : sessionStorage.setItem(v1, 1)
  //   return
  // }

  //if username already was in localStorage, then localSession continue !
  v = localStorage.getItem('username')
  v1 = localStorage.getItem('regtype')
  if (v) {
    setUsernameAndRegtype(v, v1) //as logged!

    v1 = 'PageAlreadyWasVisitedAtThisBrowserTab'
    v2 = sessionStorage.getItem(v1)
    if (!v2) {
      sessionStorage.setItem(v1, 1)
      useAJAX ? checkAndMarkUserAsDisconnectedAJAX() : postSettings()
    }
    return
  }
}

/////////////////// exchange data with server (Login, Logout, Registration, ...) by AJAX /////////////////////////

//fetch 'post registration'
async function postRegistrationAjax() {

  const userPassData = getUserPassDataForPost()
  if (!userPassData) {
    return
  }
  outputOkMessage('User registration...')

  const response = await fetch('/registrationAJAX', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
    body: userPassData
  })

  if (response.ok) {
    const jsonObj = await response.json()
    out('jsonObj: ' + new Date())
    out(jsonObj)
    if (jsonObj['errorMsg']) {
      let v = jsonObj['errorMsg']['message']
      if (v) {
        outputErrorMessage(`Registration error: ${v}`)
      } else {
        v = jsonObj['errorMsg']
        if (v) {
          outputErrorMessage(`Reg.error: ${v}`)
        } else {
          outputErrorMessage(`Registration unknown error`)
        }
      }
      return
    }
    outputOkMessage('User registered.')

    const user = jsonObj.usernameAfterRegistration
    if (user) {
      alert('User <' + user + '> registered.') //delay
      postLoginAjax()
      return
    } else {
      outputErrorMessage('Impossible to login after registration (username is empty).')
    }
    return
  }
  outputErrorMessage('Error occured during registration.')
}

//fetch 'post login'
async function postLoginAjax() {

  const userPassData = getUserPassDataForPost()
  if (!userPassData) {
    return
  }
  outputOkMessage('User login...')

  const response = await fetch('/loginAJAX', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    },
    body: userPassData
  })

  if (response.ok) {
    const jsonObj = await response.json()
    out('jsonObj: ' + new Date())
    out(jsonObj)
    if (jsonObj['errorMsg']) {
      const v = jsonObj['errorMsg']['message']
      if (v) {
        outputErrorMessage(`Login error: ${v}`)
      } else {
        outputErrorMessage('Login unknown error')
      }
      return
    }
    outputOkMessage('User logged in.')

    let v, v1, v2, v3, v4, v5, v6, v7

    v = jsonObj.usernameAfterLogin
    if (v) {
      v1 = jsonObj.regtypeAfterLogin
      setUsernameAndRegtype(v, v1)
      localStorage.setItem('username', username)
      localStorage.setItem('regtype', regtype)

      //PlayerNamesAfterLogin, isDarkThemeAfterLogin, ...AfterLogin
      v1 = jsonObj.LichessOrgPlayerNamesAfterLogin
      if (v1) {
        setLichessOrgPlayerNames(v1)
        localStorage.setItem('LichessOrgPlayerNames', v1)
      }

      v2 = jsonObj.ChessComPlayerNamesAfterLogin
      if (v2) {
        setChessComPlayerNames(v2)
        localStorage.setItem('ChessComPlayerNames', v2)
      }

      v3 = false
      v = jsonObj.isDarkThemeAfterLogin
      if (v) {
        v3 = (v === '1' ? true : false)
        setCheckDarkTheme(v3)
        localStorage.setItem('DarkThemeChecked', v3 ? '1' : '0')
        setTheme()
      }

      v4 = false
      v = jsonObj.CheckLichessAfterLogin
      if (v) {
        v4 = (v === '1' ? true : false)
        setCheckLichess(v4)
        localStorage.setItem('LichessChecked', v4 ? '1' : '0')
      }

      v5 = false
      v = jsonObj.CheckChessComAfterLogin
      if (v) {
        v5 = (v === '1' ? true : false)
        setCheckChessCom(v5)
        localStorage.setItem('ChessComChecked', v5 ? '1' : '0')
      }

      v6 = false
      v = jsonObj.isFirstChessComAfterLogin
      if (v) {
        v6 = (v === '1' ? true : false)
        if (v6 !== isFirstChessCom) {
          isFirstChessCom = v6
          changeTablesOrder()
        }
        localStorage.setItem('isFirstChessCom', v6 ? '1' : '0')
      }

      v7 = jsonObj.autoRefreshIntervalAfterLogin
      if (v7) {
        setAutoRefreshInterval(v7)
        localStorage.setItem('AutoRefreshInterval', v7)
      }

      if (v1 || v2 || v3 || v4 || v5 || v6) {
        refresh()
      }
    }

    goMainModeFromUser()
    return
  }
  outputErrorMessage('Error occured during login.')
}

//fetch 'post logout'
async function postLogoutAjax() {
  outputOkMessage(`${username} logout...`)

  const response = await fetch('/logoutAJAX') //method GET - by default
  if (response.ok) {
    const jsonObj = await response.json()
    const msg = jsonObj.msg
    outputOkMessage(`${username} logged out. (${msg})`)

    setUsernameAndRegtype('', '')
    localStorage.setItem('username', '')
    localStorage.setItem('regtype', '')

    goMainModeFromUser()
    return
  }
  outputErrorMessage('Error occured during logout.')
}

function getUserPassDataForPost() {

  let v

  //check username
  v = document.querySelector('#username').value.trim()
  if (!v) {
    alert('Fill username !')
    return ''
  } else if (v.toLowerCase() === 'anonym') {
    alert('This username is unacceptable !')
    return ''
  } else if (v.indexOf(' ') >= 0) {
    alert('Username should not contain a space !')
    return ''
  }
  let user = v

  //check password
  v = document.querySelector('#password').value
  if (!v) {
    alert('Fill password !')
    return ''
  } else if (v.indexOf(' ') >= 0) {
    alert('Password should not contain a space !')
    return ''
  }
  let pass = v

  return 'username=' + encodeURIComponent(user) + '&password=' + encodeURIComponent(pass)
}

//send Lichess & Chess.com PlayerNames and other settings to server: AJAX
async function postSettingsAJAX() {
  let usernameLocal = username ? username : 'anonym'
  let data = {
    username: (isUserLogged() ? usernameLocal : ''),
    regtype: regtype,
    LichessOrgPlayerNames: getLichessOrgPlayerNames(),
    ChessComPlayerNames: getChessComPlayerNames(),
    AutoRefreshInterval: getAutoRefreshInterval(),
    CheckLichess: (isCheckLichess() ? '1' : '0'),
    CheckChessCom: (isCheckChessCom() ? '1' : '0'),
    isDarkTheme: (isCheckDarkTheme() ? '1' : '0'),
    isFirstChessCom: (isFirstChessCom ? '1' : '0')
  }
  try {
    const response = await fetch('/sendUserSettingsToServerAJAX', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(data)
    })
    if (response.ok) {
      const jsonObj = await response.json()
      out('jsonObj: ' + new Date())
      out(jsonObj)
      if (jsonObj['afterSendUserSettingsToServerAJAX']) {
        return //ok, send.
      }
      out('Error occured during afterSendUserSettingsToServerAJAX.')
      markUserAsDisconnected()
    } else {
      out('Error occured during sendUserSettingsToServerAJAX.')
    }
  } catch (err) {
    if (!isUserMarkedAsDisconnected()) {
      //alert('Network/Server error: ' + err.message)
      alert('Network/Server error')
    }
    // out('FetchError during sendUserSettingsToServerAJAX:')
    // out(err.message)
    markUserAsDisconnected()
  }
}

async function checkAndMarkUserAsDisconnectedAJAX() {
  let data = { username: username }
  const response = await fetch('/isUserLoggedAJAX', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data)
  })
  if (response.ok) {
    const jsonObj = await response.json()
    out('isUserLoggedAJAX: jsonObj: ' + new Date())
    out(jsonObj)
    const v = jsonObj['isUserLoggedAJAX']
    if (v) {
      if (v === '0') {
        markUserAsDisconnected()
      }
      return
    }
    out('Error occured during afterIsUserLoggedAJAX.')
    return
  }
  out('Error occured during isUserLoggedAJAX.')
}

function outputErrorMessage(msg) {
  document.querySelector('#errorMessage').textContent = msg
  document.querySelector('#okMessage').textContent = ''
}

function outputOkMessage(msg) {
  document.querySelector('#errorMessage').textContent = ''
  document.querySelector('#okMessage').textContent = msg
}

function clearMessages() {
  document.querySelector('#errorMessage').textContent = ''
  document.querySelector('#okMessage').textContent = ''
}

/////////////////// exchange data with server (Login, Logout, Registration, ...) by reload page /////////////////////////

function postLogin() {
  useAJAX ? postLoginAjax() : postCheckAndAction('/login')
}

function postLogout() {
  useAJAX ? postLogoutAjax() : postUserAction('/logout', '1', '1')
}

function postRegistration() {
  useAJAX ? postRegistrationAjax() : postCheckAndAction('/registration')
}

function postCheckAndAction(action) {

  let v

  //check username
  v = document.querySelector('#username').value.trim()
  if (!v) {
    alert('Fill username !')
    return
  } else if (v.toLowerCase() === 'anonym') {
    alert('This username is unacceptable !')
    return
  } else if (v.indexOf(' ') >= 0) {
    alert('Username should not contain a space !')
    return
  }
  user = v

  //check password
  v = document.querySelector('#password').value.trim()
  if (!v) {
    alert('Fill password !')
    return
  } else if (v.indexOf(' ') >= 0) {
    alert('Password should not contain a space !')
    return
  }
  pass = v

  postUserAction(action, user, pass)
}

//emulate submit post-action for user: '/login' or '/logout' or '/registration'
function postUserAction(action, username, password) {
  let form = document.createElement('form')
  form.action = action
  form.method = 'POST'
  form.innerHTML = '<input name="username" value="' + username + '">'
    + '<input name="password" value="' + password + '">'
  document.body.append(form)
  form.submit()
  form.remove()
}

//send Lichess & Chess.com PlayerNames and other settings to server
function postSettings() {
  let usernameLocal = (username ? username : 'anonym')
  let form = document.createElement('form')
  form.action = '/sendUserSettingsToServer'
  form.method = 'POST'
  form.innerHTML = '<input name="username" value="' + usernameLocal + '">'
    + '<input name="regtype" value="' + regtype + '">'
    + '<input name="LichessOrgPlayerNames" value="' + getLichessOrgPlayerNames() + '">'
    + '<input name="ChessComPlayerNames" value="' + getChessComPlayerNames() + '">'
    + '<input name="CheckLichess" value="' + (isCheckLichess() ? '1' : '0') + '">'
    + '<input name="CheckChessCom" value="' + (isCheckChessCom() ? '1' : '0') + '">'
    + '<input name="AutoRefreshInterval" value="' + getAutoRefreshInterval() + '">'
    + '<input name="isDarkTheme" value="' + (isCheckDarkTheme() ? '1' : '0') + '">'
    + '<input name="isFirstChessCom" value="' + (isFirstChessCom ? '1' : '0') + '">'

  document.body.append(form)
  form.submit()
  form.remove()
}

/////////////////////////////////////////////////////////////////////////////

function setUsernameAndRegtype(user, type) {
  username = (user ? user : '')
  regtype = (type ? type : '')
  regtype = (regtype === 'userpass' ? '' : regtype)
  vm.vueCurrentUsername = username
}

function isUserLogged() {
  const v1 = vm.vueCurrentUsername
  return (username) && (v1.indexOf(DISCONNECTED_TEXT) === -1)
}

function markUserAsDisconnected() {
  vm.vueCurrentUsername = username + DISCONNECTED_TEXT
}

function isUserMarkedAsDisconnected() {
  const v = vm.vueCurrentUsername
  return (v.indexOf(DISCONNECTED_TEXT) >= 0)
}

const path = require('path')

module.exports = {
  entry: './public/js/chess.js',
  module: {
    rules: [
      { test: /\.(js)$/, use: 'babel-loader' }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'chessb.js'
  },
  mode: 'production'
}

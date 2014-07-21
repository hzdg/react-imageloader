path = require 'path'
webpack = require 'webpack'

module.exports =
  entry: path.join __dirname, 'src', 'index.coffee'
  output:
    path: path.join __dirname, 'standalone'
    filename: 'react-imageloader.js'
    library: 'ReactImageLoader'
    libraryTarget: 'umd'
    target: 'web'
  externals: ['React', react: 'React']
  module:
    loaders: [
      {test: /\.coffee$/, loader: 'coffee'}
    ]
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]

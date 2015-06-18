import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';

const webpackConfig = {
  devtool: 'eval',
  entry: {tests: path.join(__dirname, 'tests.js')},
  output: {path: path.join(__dirname, 'built'), filename: '[name].js'},
  module: {loaders: [{test: /\.js$/, loader: 'babel'}]},
};

const app = express()
  .get('/', (req, res) => { res.sendFile(path.join(__dirname, './index.html')); })
  .get('/mocha.js', (req, res) => { res.sendFile(path.join(__dirname, '../node_modules/mocha/mocha.js')); })
  .get('/mocha.css', (req, res) => { res.sendFile(path.join(__dirname, '../node_modules/mocha/mocha.css')); })
  .use('/built', webpackMiddleware(webpack(webpackConfig), {stats: {colors: true}}));

app.listen(8080);
console.log('server listening at 0.0.0.0:8080');

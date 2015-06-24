import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import open from 'opn';
import yargs from 'yargs';

const argv = yargs
  .boolean('open', 'o', false)
  .argv;

const webpackConfig = {
  devtool: 'eval',
  entry: {tests: path.join(__dirname, 'tests.js')},
  output: {path: path.join(__dirname, 'built'), filename: '[name].js'},
  module: {loaders: [{test: /\.js$/, exclude: /node_modules/, loader: 'babel?stage=0&optional[]=runtime'}]},
};

const app = express()
  .get('/', (req, res) => { res.sendFile(path.join(__dirname, './index.html')); })
  .get('/chai.js', (req, res) => { res.sendFile(path.join(__dirname, '../node_modules/chai/chai.js')); })
  .get('/mocha.js', (req, res) => { res.sendFile(path.join(__dirname, '../node_modules/mocha/mocha.js')); })
  .get('/mocha.css', (req, res) => { res.sendFile(path.join(__dirname, '../node_modules/mocha/mocha.css')); })
  .use('/built', webpackMiddleware(webpack(webpackConfig), {stats: {colors: true}}))
  .use(express.static(path.join(__dirname)));

app.listen(8080, err => {
  if (err) throw err;
  console.log('server listening at 0.0.0.0:8080');
  if (argv.open) open('http://0.0.0.0:8080');
});

const webpack = require('webpack');
const conf = require('./gulp.conf');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SplitByPathPlugin = require('webpack-split-by-path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require('autoprefixer');

module.exports = {
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint'
      }
    ],

    loaders: [
      {
        test: /.json$/,
        loaders: [
          'json'
        ]
      },
      {
        test: /\.(css|scss)$/,
        loaders: ExtractTextPlugin.extract('style', 'css?minimize!sass', 'postcss')
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'ng-annotate',
          'babel'
        ]
      },
      {
        test: /\.(woff|woff2)$/,
        loaders: [
          'url?limit=10000&mimetype=application/font-woff'
        ]
      },
      {
        test: /\.ttf$/,
        loaders: [
          'url?limit=10000&mimetype=application/octet-stream'
        ]
      },
      {
        test: /\.eot$/,
        loaders: [
          'file'
        ]
      },
      {
        test: /\.svg$/,
        loaders: [
          'url?limit=10000&mimetype=image/svg+xml'
        ]
      },
      
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: conf.path.src('index.html'),
      inject: true
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {unused: true, dead_code: true} // eslint-disable-line camelcase
    }),
    new SplitByPathPlugin([{
      name: 'vendor',
      path: path.join(__dirname, '../node_modules')
    }]),
    new ExtractTextPlugin('/index-[contenthash].css')
  ],
  postcss: () => [autoprefixer],
  output: {
    path: path.join(process.cwd(), conf.paths.dist),
    filename: '[name]-[hash].js'
  },
  entry: {
    app: [
      `./${conf.path.src('index')}`,
      `./${conf.path.tmp('templateCacheHtml.js')}`
    ]
  }
};

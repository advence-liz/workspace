const path = require('path')
const webpack = require('webpack')
const fs = require('fs-extra')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { module: currentModule, root } = fs.readJsonSync('.qsrc.json')
module.exports = {
  entry: path.resolve(root, currentModule),

  mode: 'development',
  context: __dirname,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.(less|css)$/,
        use: [
          {
            loader: 'style-loader' // creates style nodes from JS strings
          },
          {
            loader: 'css-loader' // translates CSS into CommonJS
            // options: { modules: true }
          },
          {
            loader: 'less-loader' // compiles Less to CSS
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.(art|ejs)$/,
        loader: 'art-template-loader',
        options: {
          compileDebug: true
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.scss']
    // alias: {
    //   react: 'preact-compat',
    //   'react-dom': 'preact-compat'
    // }
  },
  devtool: 'source-map',
  devServer: {
    overlay: true,
    host: '0.0.0.0',
    useLocalIp: true,
    historyApiFallback: true
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(['build']),
    new CopyPlugin([{ from: 'asserts/**/*' }]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: '../_template/_layout.ejs',
      favicon: '../_template/favicon.ico',
      // inject: false,
      title: currentModule
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify('5fa3b9')
    })
  ]
}

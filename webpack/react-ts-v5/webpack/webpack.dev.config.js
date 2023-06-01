const { merge } = require('webpack-merge')
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const base = require('./webpack.base.config')
const HTML_PATH = path.join('./webpack/html')

module.exports = () => {
  const config = {
    mode: 'development',
    target: 'web',
    devtool: 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: `${HTML_PATH}/index.dev.ejs`,
        inject: 'body',
        // chunks: ['bundle'],
        favicon: path.join(__dirname, 'public', 'favicon.ico'),
        scriptLoading: 'blocking',
        minify: {
          collapseWhitespace: true,
        },
      }),
    ],
    optimization: { moduleIds: 'named' },
    devServer: {
      // contentBase: path.join(__dirname, '..', '..', 'build'),
      // compress: true,
      hot: true,
      // useLocalIp: true,
      // port: 8000,
      // proxy: {
      //   '/client': {
      //     target: 'http://xxx.com',
      //     pathRewrite: {
      //       '/client': '',
      //     },
      //   },
      // },
    },
  }
  return merge(base(), config)
}

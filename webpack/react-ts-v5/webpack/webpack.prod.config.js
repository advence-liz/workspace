const { merge } = require('webpack-merge')
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const base = require('./webpack.base.config')
// const RaptorSourcemapUploadPlugin = require('@bfe/raptor-sourcemap-upload-plugin')
const HTML_PATH = path.join('./webpack/html')

module.exports = () => {
  console.log('process.env.HOST_ENV', process.env.HOST_ENV)
  const config = {
    target: ['web', 'es5'],
    mode: 'production',
    output: {
      // path: path.resolve('build'),
      chunkFilename: '[name][contenthash].js',
      filename: '[contenthash].js',
      publicPath: 'https://assets.com/', // 静态资源路径固定为线上
    },
    // devtool: 'source-map',
    plugins: [
      new MiniCssExtractPlugin({ filename: '[name][contenthash].css' }),
      
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: `${HTML_PATH}/index.ejs`,
        // inject: 'body',
        // inject: false,
        // PUBLISH_ENV: process.env.PUBLISH_ENV,
        favicon: path.join(__dirname, 'public', 'favicon.ico'),

        scriptLoading: 'blocking',
        // minify: {
        //   collapseWhitespace: true
        // }
        minify: {
          html5: true, // 根据HTML5规范解析输入
          collapseWhitespace: true, // 折叠空白区域
          preserveLineBreaks: false,
          minifyCSS: true, // 压缩文内css
          minifyJS: true, // 压缩文内js
          removeComments: false, // 移除注释
        },
      }),

     
    ],
    optimization: { moduleIds: 'deterministic' },
  }
  return merge(base(), config)
}

const path = require('path')
const base = process.cwd()
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HTML_PATH = path.join('./webpack/html')

module.exports = () => {
  return {
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@assets': path.resolve('src/assets'),
        '@components': path.resolve('src/components'),
        '@models': path.resolve('src/models'),
        '@routes': path.resolve('src/routes'),
        '@pages': path.resolve('src/pages'),
        '@utils': path.resolve('src/utils'),
        '@config': path.resolve('src/config'),
        '@services': path.resolve('src/services'),
        '@stores': path.resolve('src/stores'),
      },
      fallback: {
        assert: false,
        path: false,
      },
    },
    entry: './src',
    // externals: {
    //   '@eva/eva.js': 'EVA',
    //   'pixi.js': 'PIXI'
    // },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: '[name]-[local]-[hash:base64:5]',
                },
              },
            },
            // {
            //   loader: 'pxtovw-loader',
            //   options: {
            //     unitToConvert: 'px', //Custom conversion unit
            //     viewportWidth: 1920, //Viewport width
            //     unitPrecision: 3, //retain decimal places
            //     minPixelValue: 2, // minimum conversion value
            //   },
            // },
            {
              loader: 'sass-loader',
            },
          ],
        },
        {
          test: /\.(sass|css)$/,
          use: [
            'style-loader',
            'css-loader',
            // {
            //   loader: 'pxtovw-loader',
            //   options: {
            //     unitToConvert: 'px', //Custom conversion unit
            //     viewportWidth: 1920, //Viewport width
            //     unitPrecision: 5, //retain decimal places
            //     minPixelValue: 2, // minimum conversion value
            //   },
            // },
            {
              loader: 'sass-loader',
            },
          ],
        },
        {
          test: /.(png|jpg|gif|svg|jpeg)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
              },
            },
          ],
        },
        {
          test: /.(woff|woff2|eot|ttf|otf)$/,
          use: ['file-loader'],
        },
      ],
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[id].js',
      path: path.resolve('./build'),
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: `css/[name]-[hash:20].css`,
      }),
    ],
  }
}

const webpack = require('webpack')
const webpackProdConfig = require('../webpack.prod.config')()
// const { merge } = require('webpack-merge')

console.log('process.env.HOST_ENV', process.env.HOST_ENV)
function run() {
    const compiler = webpack(
        webpackProdConfig,
        // merge(webpackProdConfig, {
        //     output: {
        //         publicPath: CDNMap[process.env.HOST_ENV] || ''
        //     }
        // })
    )
    compiler.run((err, stats) => {
        if (err) {
            console.err(err)
            return
        }
        console.log(
            stats.toString({
                chunks: true,
                colors: true,
                assets: true
            })
        )
    })
}

run()
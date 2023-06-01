const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackDevConfig = require('../webpack.dev.config')()
const { merge } = require('webpack-merge')
const getPort = require('../lib/getPort')
// const getPort = require('../../lib/getPort')

function run() {
    const compiler = webpack(merge(webpackDevConfig))

    const server = new WebpackDevServer(
        {
         
        },
        compiler
    )

    server.listen(getPort(8000))
}
// module.exports = () => {

// }

run()

// 导入 webpack-chain 模块，该模块导出了一个用于创建一个 webpack 配置 API 的单一构造函数。
const Config = require('webpack-chain')
const path = require('path')
const LibraryName = 'eeeee'

// 对该单一构造函数创建一个新的配置实例
const config = new Config()
config.merge({
    target: ['web', 'es5'],
    // mode: 'development',
    mode: 'production',
    entry: {
        main: {
            import: './src',
            library: {
                // `output.library` 下的所有配置项可以在这里使用
                name: LibraryName,
                type: 'umd',
                umdNamedDefine: true
            }
        },
        esm: {
            import: './src',
            library: {
                name: 'AnotherLibrary',
                type: 'commonjs2'
            }
        }
    },
    output: {
        // ...
        path: path.resolve('dist'),
        chunkFilename: '[contenthash].js',
        asyncChunks: false,

        filename: `[name].js` // 打包后的文件名称
        // umdNamedDefine: true,
        // publicPath
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        superagent: 'superagent'
    },
    // devtool: 'source-map',
    plugins: []
})

// ... 中间一系列 webpack 的配置，我们在后续的章节再陆续说明，这里暂且省略

// 导出这个修改完成的要被 webpack 使用的配置对象
config.externals({ react: 'React', 'react-dom': 'ReactDOM' })
var r = config.toConfig()
console.log(r)

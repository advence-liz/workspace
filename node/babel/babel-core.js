const { transformSync } = require('@babel/core')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.resolve(__dirname, './code.js'))
const result = transformSync(code, {
    // presets: ['@babel/preset-stage-2'],
    plugins: [
        // Stage 2
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-proposal-function-sent',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-numeric-separator',
        '@babel/plugin-proposal-throw-expressions',

        // Stage 3
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-syntax-import-meta',
        ['@babel/plugin-proposal-class-properties', { loose: false }],
        '@babel/plugin-proposal-json-strings'
    ]
})
// yarn add @babel/plugin-proposal-decorators @babel/plugin-proposal-function-sent @babel/plugin-proposal-export-namespace-from @babel/plugin-proposal-numeric-separator @babel/plugin-proposal-throw-expressions  @babel/plugin-syntax-dynamic-import @babel/plugin-syntax-import-meta @babel/plugin-proposal-class-properties  @babel/plugin-proposal-json-strings
console.log(result)
result.code
result.map
result.ast

const { transformSync } = require('@babel/core')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.resolve(__dirname, './code.js'))
// preset-env 自动引入 plugin 和 poliyfill 可以替换到  Stage 0 12 
const result = transformSync(code, {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: { ios: '8', android: '4' },
                debug: true,
                useBuiltIns: 'usage',
                corejs: '3'
                // defaults to "2.0". The version string can be any supported core-js versions. For example, "3.8" or "2.0".
            },
            // 'exclude':[]
        ]
        // plugins: [
        //      // Stage 0
        // "@babel/plugin-proposal-function-bind",

        // // Stage 1
        // "@babel/plugin-proposal-export-default-from",
        // "@babel/plugin-proposal-logical-assignment-operators",
        // ["@babel/plugin-proposal-optional-chaining", { "loose": false }],
        // ["@babel/plugin-proposal-pipeline-operator", { "proposal": "minimal" }],
        // ["@babel/plugin-proposal-nullish-coalescing-operator", { "loose": false }],
        // "@babel/plugin-proposal-do-expressions",

        // // Stage 2
        // ["@babel/plugin-proposal-decorators", { "legacy": true }],
        // "@babel/plugin-proposal-function-sent",
        // "@babel/plugin-proposal-export-namespace-from",
        // "@babel/plugin-proposal-numeric-separator",
        // "@babel/plugin-proposal-throw-expressions",

        // // Stage 3
        // "@babel/plugin-syntax-dynamic-import",
        // "@babel/plugin-syntax-import-meta",
        // ["@babel/plugin-proposal-class-properties", { "loose": false }],
        // "@babel/plugin-proposal-json-strings"
    ],
    cwd: path.resolve(__dirname,'..','node')
})
// yarn add @babel/plugin-proposal-decorators @babel/plugin-proposal-function-sent @babel/plugin-proposal-export-namespace-from @babel/plugin-proposal-numeric-separator @babel/plugin-proposal-throw-expressions  @babel/plugin-syntax-dynamic-import @babel/plugin-syntax-import-meta @babel/plugin-proposal-class-properties  @babel/plugin-proposal-json-strings
// console.log(result)
fs.writeFileSync(path.resolve(__dirname,'dist','code.js'),result.code)
// result.code
// result.map
// result.ast

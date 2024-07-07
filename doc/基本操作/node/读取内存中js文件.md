

## require hook

```js 
const Module = require('module')
const path = require('path')

const _require = Module.prototype.require

const _extensions = Module._extensions

const _findPath = Module._findPath

Module._findPath = function (...args) {
  const [request] = args
  if (request.endsWith('.jsm')) {
    return request
  }
  return _findPath(...args)
}
Module.prototype.require = function (...args) {
  // umd 代码中引入 react 引入全局变量为 React，react-dom 则为 ReactDom
  if (args[0] === 'React') {
    args[0] = 'react'
  }
  // 覆盖某些不支持node 中运行的 sdk 沙箱
  if (args[0] === 'XXXSDK') {
    return globalThis.XXXSDK
  }

  if (globalThis.dynamicJSMCache.has(args[0])) {
    return require(`${args[0]}.jsm`)
  }

  return _require.apply(this, args)
}

globalThis.JSMCache = new Map()
globalThis.dynamicJSMCache = new Set()

_extensions['.jsm'] = function (module, filename) {
  const content = globalThis.JSMCache.get(filename)
  module._compile(content, filename)
}
```
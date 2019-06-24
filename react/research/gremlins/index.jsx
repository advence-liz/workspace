import React from 'react'
import ReactDOM from 'react-dom'
// import './gremlins.min.js'
import App from './gremlins'
ReactDOM.render(<App />, document.getElementById('root'))
console.log(process.env.NODE_ENV)

function unleashGremlins (ttl = 100000, callback) {
  const horde = window.gremlins.createHorde()
  function stop () {
    horde.stop()
    callback && callback()
  }
  horde
    .before(function startProfiler () {
      /**
       * @param {String}  errorMessage   错误信息
       * @param {String}  scriptURI      出错的文件
       * @param {Long}    lineNumber     出错代码的行号
       * @param {Long}    columnNumber   出错代码的列号
       * @param {Object}  errorObj       错误的详细信息，Anything
       */
      window.onerror = function (
        errorMessage,
        scriptURI,
        lineNumber,
        columnNumber,
        errorObj
      ) {
        console.info('错误信息：', errorMessage)
        console.info('出错文件：', scriptURI)
        console.info('出错行号：', lineNumber)
        console.info('出错列号：', columnNumber)
        console.info('错误详情：', errorObj)
        window.monkeyErrors.count++
        window.monkeyErrors.message.push({ errorMessage, scriptURI })
      }
      window.monkeyErrors = {
        count: 0,
        message: [],
        done: false
      }
      console.time('gremlins')
    })
    .after(function stopProfiler () {
      console.timeEnd('gremlins')
      window.monkeyErrors.done = true
      console.error('monkeyErrors', window.monkeyErrors)
    })
    .mogwai(window.gremlins.mogwais.alert()) // 阻止了alert 弹出
    .mogwai(window.gremlins.mogwais.gizmo().maxErrors(2))

  window.onbeforeunload = stop
  setTimeout(stop, ttl)
  // horde.seed(1234);
  // 默认1000次 gremlins will act randomly, at 10 ms interval, 1000 times
  horde.unleash({ nb: 10000 })
}

window.startMonkeyTest = function () {
  var head = document.getElementsByTagName('head')[0]

  var script = document.createElement('script')
  script.src = 'https://cdn.bootcss.com/gremlins.js/0.1.0/gremlins.min.js'
  script.onload = () => {
    unleashGremlins()
  }
  head.appendChild(script)
}

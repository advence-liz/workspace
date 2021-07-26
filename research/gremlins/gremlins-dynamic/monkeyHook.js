function unleashGremlins(times, callback) {
  const horde = window.gremlins.createHorde()
  function stop() {
    horde.stop()
    callback && callback()
  }
  horde
    .before(function startProfiler() {
      /**
       * @param {String}  errorMessage   错误信息
       * @param {String}  scriptURI      出错的文件
       * @param {Long}    lineNumber     出错代码的行号
       * @param {Long}    columnNumber   出错代码的列号
       * @param {Object}  errorObj       错误的详细信息，Anything
       */
      window.addEventListener(
        'error',
        (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) => {
          console.info('错误信息：', errorMessage)
          console.info('出错文件：', scriptURI)
          console.info('出错行号：', lineNumber)
          console.info('出错列号：', columnNumber)
          console.info('错误详情：', errorObj)
          window.monkeyResult.count++
          window.monkeyResult.message.push({
            errorMessage,
            scriptURI,
            lineNumber,
            columnNumber,
            errorObj
          })
        }
      )
      window.monkeyResult = {
        count: 0,
        message: [],
        done: false
      }
      console.time('gremlins')
    })
    .after(function stopProfiler() {
      console.timeEnd('gremlins')
      window.monkeyResult.done = true
      console.error('monkeyResult', window.monkeyResult)
    })
    .gremlin(
      window.gremlins.species.clicker().canClick(function(element) {
        return element.className !== 'vc-switch'
      })
    )
    .gremlin(window.gremlins.species.formFiller())
    // .gremlin(window.gremlins.species.toucher())
    // .gremlin(window.gremlins.species.scroller())
    // .gremlin(window.gremlins.species.typer().eventTypes(['input', 'change']))
    .mogwai(window.gremlins.mogwais.alert()) // 阻止了alert 弹出
    .mogwai(window.gremlins.mogwais.gizmo().maxErrors(2))

  window.onbeforeunload = stop
  setTimeout(stop, times * 10)
  // horde.seed(1234);
  // 默认1000次 gremlins will act randomly, at 10 ms interval, 1000 times
  horde.unleash({ nb: times })
}

window.startMonkeyTest = function(times = 4096) {
  const gremlinsSource =
    'https://cdn.bootcss.com/gremlins.js/0.1.0/gremlins.min.js'
  const head = document.getElementsByTagName('head')[0]
  const scripts = document.getElementsByTagName('script')
  let isFound = false
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src === gremlinsSource) {
      isFound = true
      break
    }
  }
  if (isFound) {
    return unleashGremlins(times)
  }

  const script = document.createElement('script')
  script.src = gremlinsSource
  script.onload = () => {
    unleashGremlins(times)
  }
  head.appendChild(script)
}

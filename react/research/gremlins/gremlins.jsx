import React from 'react'

export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => {}
  // componentDidMount() {
  //   const horde = gremlins.createHorde()
  //   horde
  //     .before(function startProfiler() {
  //       /**
  //        * @param {String}  errorMessage   错误信息
  //        * @param {String}  scriptURI      出错的文件
  //        * @param {Long}    lineNumber     出错代码的行号
  //        * @param {Long}    columnNumber   出错代码的列号
  //        * @param {Object}  errorObj       错误的详细信息，Anything
  //        */
  //       window.onerror = function(
  //         errorMessage,
  //         scriptURI,
  //         lineNumber,
  //         columnNumber,
  //         errorObj
  //       ) {
  //         console.info('错误信息：', errorMessage)
  //         console.info('出错文件：', scriptURI)
  //         console.info('出错行号：', lineNumber)
  //         console.info('出错列号：', columnNumber)
  //         console.info('错误详情：', errorObj)
  //         window.monkeyErrors++
  //       }
  //       window.monkeyErrors = 0
  //       console.time('gremlins')
  //     })
  //     .after(function stopProfiler() {
  //       console.timeEnd('gremlins')
  //       console.error('monkeyErrors',window.monkeyErrors)
  //     })
  //     // .logger({
  //     //   log: function() {
  //     //     console.log(arguments)
  //     //   },
  //     //   info: function() {
  //     //     console.info(arguments)
  //     //   },
  //     //   warn: function() {
  //     //     console.warn(arguments)
  //     //   },
  //     //   error: function() {
  //     //     // 这个error 应该只是gremlin 中设置的error  例如 fps 较低那种，并不是劫持全局的异常
  //     //     console.error(arguments)
  //     //   }
  //     // })
  //     // .gremlin(gremlins.species.clicker()) //设置了那么就只有 gremlin
  //     .mogwai(gremlins.mogwais.alert()) //阻止了alert 弹出
  //     .mogwai(gremlins.mogwais.gizmo().maxErrors(2))
  //     .unleash()
  // }
  triggerError = () => {
    throw new Error('click error')
  }

  render () {
    const buttonStyle = {
      height: 200,
      display: 'block',
      width: '100%',
      background: 'red'
    }
    return (
      <div>
        <h1>Gremlins</h1>
        <button style={buttonStyle} onClick={this.triggerError}>
          11
        </button>
        <button style={buttonStyle}>22</button>
        <button style={buttonStyle}>33</button>
        <button style={buttonStyle}>44</button>
        <button style={buttonStyle}>55</button>
        <button style={buttonStyle}>66</button>
        <input type="text" />
        <input type="button" value="333" />
      </div>
    )
  }
}

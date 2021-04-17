import React, { Component } from 'react'
import { render } from 'react-dom'
import './hilo' //引入hilo
// import './lib/flexible'
import Stage from './game/stage'
export default class App extends Component {
  state = {
    scaleX: '*',
    scaleY: '*',
    innerWidth: '*',
    innerHeight: '*'
  }
  render() {
    const { scaleX, scaleY } = this.state
    return (
      <div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            width: 100,
            background: 'red',
            height: 10,
            color: '#fff'
          }}
        ></div>
        <div style={{ position: 'absolute', bottom: 0 }}>
          scaleX: {scaleX} scaleY:{scaleY}
          <div>
            innerWidth:{innerWidth}innerHeight:
            {innerHeight}
          </div>
        </div>

        <div id="game-container"></div>
      </div>
    )
  }
  componentDidMount() {
    const width = innerWidth
    const height = innerHeight
    const gameWidth = 750
    const gameHeight = 1334
    let scaleX = (width / gameWidth).toFixed(2)
    let scaleY = (height / gameHeight).toFixed(2)

    this.setState({ scaleX, scaleY, innerWidth, innerHeight })

    const stage = new Stage({
      //实例化舞台
      renderType: 'canvas', // 渲染类型 可以是canvas || div
      container: document.getElementById('game-container'), //父容器
      width: gameWidth, //舞台宽度，这里也可以写固定值
      height: gameHeight, //舞台高度，这里也可以写固定值
      scaleX,
      scaleY
    })
    // window.onresize = function() {
    //   stage.scaleX = innerWidth / gameWidth
    //   stage.scaleY = innerHeight / gameHeight
    //   // stage.resize(gameWidth, gameHeight, true)
    // }
  }
}

render(<App />, document.getElementById('root'))

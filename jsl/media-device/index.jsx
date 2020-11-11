import React from 'react'
import ReactDOM from 'react-dom'

class App extends React.Component {
  state = {
    show: false,
    e: ''
  }
  onChange = e => {
    this.setState({ e })
  }
  render () {
    const { e } = this.state
    return (
      <div>
        <h1>camera</h1>
        <video ></video>
       
        <div>{e.toString()}</div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
console.log(process.env.NODE_ENV)
// 想要获取一个最接近 1280x720 的相机分辨率
var constraints = { video: { width: 1280, height: 720 } }
navigator.mediaDevices.getSupportedConstraints()
navigator.mediaDevices
  .getUserMedia(constraints)
  .then(function (mediaStream) {
    // debugger
    var video = document.querySelector('video')
   
    video.srcObject = mediaStream
    video.onloadedmetadata = function (e) {
      video.play()
    }
  })
  .catch(function (err) {
    console.log(err.name + ': ' + err.message)
  }) // 总是在最后检查错误

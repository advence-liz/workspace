import React from 'react'
import './style.scss'
export default class App extends React.Component {
  state = {
    show: false
  }
  // componentDidMount () {
  //   var leftContent = document.querySelector('.left-content')
  //   var rightContent = document.querySelector('.right-content')
  //   var textCircle = document.querySelector('.text-circle')

  //   // 先是leftContent旋转角度从0增加到180度，
  //   // 然后是rightContent旋转角度从0增加到180度
  //   var angle = 0

  //   var timerId = setInterval(function () {
  //     angle += 30
  //     if (angle > 360) {
  //       clearInterval(timerId)
  //     } else {
  //       if (angle > 180) {
  //         rightContent.setAttribute(
  //           'style',
  //           'transform: rotate(' + (angle - 180) + 'deg)'
  //         )
  //       } else {
  //         leftContent.setAttribute(
  //           'style',
  //           'transform: rotate(' + angle + 'deg)'
  //         )
  //       }
  //       setPercent(angle)
  //     }
  //   }, 500)

  //   function setPercent (angle) {
  //     textCircle.innerHTML = parseInt((angle * 100) / 360) + '%'
  //   }
  // }
  render () {
    return (
      <div>
        <div className="con">
          <div className="percent-circle percent-circle-left">
            <div className="left-content"></div>
          </div>
          <div className="percent-circle percent-circle-right">
            <div className="right-content"></div>
          </div>
          <div className="text-circle">0%</div>
        </div>
      </div>
    )
  }
}

import React from 'react'
import './style.scss'
export default class App extends React.Component {
  state = {
    show: false
  }

  render() {
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

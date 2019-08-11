import React from 'react'
import './style.scss'
export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => {}
  render () {
    return (
      <div>
        <div className="anySector">
          <div className="r1"></div>
          <div className="r2"></div>
          <div className="dot-container">
          <div className='dot1'></div>
          <div className='dot2'></div>
          </div>
        
        </div>
      </div>
    )
  }
}

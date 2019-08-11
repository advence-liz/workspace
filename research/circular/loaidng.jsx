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
        </div>
      </div>
    )
  }
}

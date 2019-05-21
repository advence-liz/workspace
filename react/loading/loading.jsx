import React from 'react'

export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => {}
  render () {
    return (
      <div className="async-component-loading">
        <div className="sk-wave">
          <div className="sk-rect sk-rect1" />
          <div className="sk-rect sk-rect2" />
          <div className="sk-rect sk-rect3" />
          <div className="sk-rect sk-rect4" />
          <div className="sk-rect sk-rect5" />
        </div>
      </div>
    )
  }
}

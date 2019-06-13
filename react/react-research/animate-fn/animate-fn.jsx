import React from 'react'
import './animation'

export default class App extends React.Component {
  state = {
    show: false,
    width: 0
  }
  onChange = e => {}

  componentDidMount () {
    Math.animation(0, 300, val => {
      this.setState({ width: val })
    })
  }
  render () {
    const { width } = this.state
    const animationStyle = { background: 'red', height: 200, width }
    return (
      <div>
        <div style={animationStyle}></div>
      </div>
    )
  }
}

import React, { Component } from 'react'
import { render } from 'react-dom'
import ScrollTips from './components/scroll-tips'

export default class App extends Component {
  render() {
    return (
      <div>
        Hello World !
        <ScrollTips />
      </div>
    )
  }
}

render(<App />, document.getElementById('root'))

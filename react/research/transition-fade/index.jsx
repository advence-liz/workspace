import React from 'react'
import ReactDOM from 'react-dom'
import { CSSTransition } from 'react-transition-group'

import './style.scss'

class Example extends React.Component {
  state = {
    fadeIn: true
  }
  toggle = () => {
    const { fadeIn } = this.state
    this.setState({ fadeIn: !fadeIn })
  }
  onEnter = () => {
    console.time('enter')
  }
  onEntered = () => {
    console.timeEnd('enter')
  }

  onExit = () => {
    console.time('exit')
  }
  onExited = () => {
    console.timeEnd('exit')
  }

  render () {
    const { fadeIn } = this.state
    return (
      <div>
        <h1>CSSTransition</h1>
        <button onClick={this.toggle}>toggle </button>
        <hr />
        <h2>animation</h2>
        <div className="demo-wrap">
          <CSSTransition
            in={fadeIn}
            timeout={2000}
            unmountOnExit
            classNames="fade-animation"
            onEnter={this.onEnter}
            onEntered={this.onEntered}
            onExit={this.onExit}
            onExited={this.onExited}
            // onExited={() => {
            //   this.setState({
            //     fadeIn: false
            //   })
            // }}
          >
            <div className="demo" >fade-{fadeIn ? 'in' : 'out'}</div>
          </CSSTransition>
        </div>

        <h2>Transition</h2>
        <div className="demo-wrap">
          <CSSTransition
            in={fadeIn}
            timeout={2000}
            unmountOnExit
            classNames="fade-transition"
            // onEnter={this.onEnter}
            // onEntered={this.onEntered}
            // onExit={this.onExit}
            // onExited={this.onExited}
            // onExited={() => {
            //   this.setState({
            //     fadeIn: false
            //   })
            // }}
          >
            <div className="demo">fade-{fadeIn ? 'in' : 'out'}</div>
          </CSSTransition>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('root'))

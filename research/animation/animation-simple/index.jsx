import React from 'react'
import ReactDOM from 'react-dom'
import Animation from './animation'

import './style.scss'

class Example extends React.Component {
  state = {
    fadeIn: true,
    slideIn: true,
    zoomIn: true
  }
  toggleProxy = type => {
    this.toggle(type)
  }
  toggle = type => {
    this.setState({ [type]: !this.state[type] })
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

  render() {
    const { fadeIn, slideIn, zoomIn } = this.state
    return (
      <div>
        <h1>animation </h1>

        <hr />

        <h2>animation fade</h2>
        <button
          type="button"
          className="btn btn-default"
          onClick={this.toggle.bind(this, 'fadeIn')}
        >
          toggle
        </button>
        <div className="demo-wrap">
          <Animation in={fadeIn} classNames="fade-animation">
            {<div className="demo">fade-{fadeIn ? 'in' : 'out'}</div>}
          </Animation>
        </div>

        <h2>animation slide</h2>
        <button
          type="button"
          className="btn btn-default"
          onClick={this.toggle.bind(this, 'slideIn')}
        >
          toggle
        </button>
        <div className="demo-wrap">
          <Animation in={slideIn} classNames="slide-animation">
            {<div className="demo slide">slide-{slideIn ? 'in' : 'out'}</div>}
          </Animation>
        </div>
        <h2>animation zoom</h2>
        <button
          type="button"
          className="btn btn-default"
          onClick={this.toggle.bind(this, 'zoomIn')}
        >
          toggle
        </button>
        <div className="demo-wrap">
          <div className="zoom__wrap">
            <Animation in={zoomIn} classNames="zoom-animation">
              {<div className="demo zoom">zoom-{zoomIn ? 'in' : 'out'}</div>}
            </Animation>
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('root'))

import React from 'react'
import ReactDOM from 'react-dom'
import Animation from './animation'

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
        <h1>test animation </h1>
        <button onClick={this.toggle}>toggle </button>
        <hr />
        <h2>animation</h2>
        <div id="main" data-anijs="if: mouseover, do: swing animated">
        Main (MouseOver)
    </div>
        <Animation
          in={fadeIn}
          timeout={2000}
          // unmountOnExit={false}
          classNames="fade-animation"
        >
          <div className="demo">fade-{fadeIn ? 'in' : 'out'}</div>
        </Animation>
      </div>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('root'))

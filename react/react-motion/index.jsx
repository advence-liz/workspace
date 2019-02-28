import React from 'react'
import ReactDOM from 'react-dom'
import { Motion, spring } from 'react-motion'

import './style.scss'

class Example extends React.Component {
  state = {
    fadeIn: true
  }

  render () {
    const max =1000
    return (
      <Motion
        defaultStyle={{ x: 0, y: 0 }}
        style={{ x: spring(max), y: spring(30) }}
      >
        {({ x, y }) => {
          if (x === 0) console.time('m')
          if (x === max) console.timeEnd('m')
          console.count('time')
          return (
            <div>
              {x}
            </div>
          )
        }}
      </Motion>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('root'))

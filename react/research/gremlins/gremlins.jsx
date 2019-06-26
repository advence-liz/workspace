import React from 'react'

export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => {}

  triggerError = () => {
    throw new Error('click error')
  }

  render () {
    const buttonStyle = {
      height: 200,
      display: 'block',
      width: '100%',
      background: 'red'
    }
    return (
      <div>
        <h1>Gremlins</h1>
        <button
          className="vc-switch"
          id="no"
          style={buttonStyle}
          onClick={this.triggerError}
        >
          11
        </button>
        <button style={buttonStyle} onClick={this.triggerError}>
          22
        </button>
        <button style={buttonStyle}>33</button>
        <button style={buttonStyle}>44</button>
        <button style={buttonStyle}>55</button>
        <button style={buttonStyle}>66</button>
        <input type="text" />
        <input type="button" value="333" />
      </div>
    )
  }
}

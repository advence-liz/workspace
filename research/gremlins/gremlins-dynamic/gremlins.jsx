import React from 'react'

export default class App extends React.Component {
  state = {
    show: false,
    name: 'liz',
    age: 1
  }
  onChange = event => {
    const {
      target: { value, name }
    } = event
    this.setState({ [name]: value })
  }

  triggerError = () => {
    throw new Error('click error')
  }
  triggerInput = () => {
    // 创建事件
    var keyboardEvent = document.createEvent('Event')
    var ele = document.querySelector('[name="name"]')
    var key = 65
    keyboardEvent.initEvent('keydown', true, true)
    // keyboardEvent.keyCode = key
    // keyboardEvent.which = key
    keyboardEvent.key = key
    ele.focus()
    ele.dispatchEvent(keyboardEvent)
  }
  render() {
    const buttonStyle = {
      // height: 50,
      display: 'block',
      width: '100%'
      // background: 'red'
    }
    return (
      <div>
        <h1>Gremlins</h1>
        <button
          className="vc-switch"
          id="no"
          style={{ ...buttonStyle, ...{ background: 'red', height: 200 } }}
          onClick={this.triggerError}
        >
          11
        </button>
        <button
          style={buttonStyle}
          // onClick={this.triggerError}
          type="button"
          className="btn btn-primary"
        >
          22
        </button>
        <button style={buttonStyle} type="button" className="btn btn-primary">
          33
        </button>
        <button style={buttonStyle} type="button" className="btn btn-primary">
          44
        </button>
        <button style={buttonStyle} type="button" className="btn btn-primary">
          55
        </button>
        <button style={buttonStyle} type="button" className="btn btn-primary">
          66
        </button>
        <button
          style={buttonStyle}
          type="button"
          className="btn btn-primary"
          onClick={this.triggerInput}
        >
          trigger input
        </button>
        <input
          type="text"
          name="name"
          className="form-control"
          onChange={this.onChange}
          value={this.state.name}
        />
        <div>{this.state.name}</div>
        <input
          type="text"
          name="age"
          className="form-control"
          onChange={this.onChange}
          value={this.state.age}
        ></input>
        <div>{this.state.age}</div>
      </div>
    )
  }
}

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
        <input type="text" className="form-control" />
        <input type="text" className="form-control"></input>
      </div>
    )
  }
}

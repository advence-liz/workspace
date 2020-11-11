import React from 'react'

export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => {}
  render () {
    return (
      <div>
        <h2>camear</h2>
        <input type="file" accept="image/*" capture="camera" />
        <br />
        <h2>camcorder</h2>
        <input type="file" accept="video/*" capture="camcorder" />
        <br />
        <h2>microphone</h2>
        <input type="file" accept="audio/*" capture="microphone" />
      </div>
    )
  }
}

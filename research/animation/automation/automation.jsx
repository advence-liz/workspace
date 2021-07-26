import React from 'react'

export default class App extends React.Component {
  state = {
    show: false,
    value: '1'
  }
  onChange = e => {}
  inputChange = e => {
    const {
      target: { value }
    } = e
    this.setState({ value })
  }
  componentDidMount() {
    // gremlins.createHorde().unleash()
  }
  render() {
    const { value } = this.state
    return (
      <div>
        <h1>Automation</h1>
        <input value={value} onChange={this.inputChange}></input>
      </div>
    )
  }
}

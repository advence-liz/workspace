import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Password from '../index'

class PasswordDemo extends React.Component {
  state = { value: '', submitValue: '' }
  onChange = value => {
    this.setState({ value })
  }
  submit = val => {
    this.setState({ submitValue: val })
  }
  render() {
    const { value, submitValue } = this.state
    return (
      <div>
        <Password onChange={this.onChange} submit={this.submit} />
        <div>{value}</div>
        <div>
          submit
          {submitValue}
        </div>
        <Password />
        <Password />
      </div>
    )
  }
}

ReactDOM.render(<PasswordDemo />, document.getElementById('root'))

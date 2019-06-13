import React from 'react'

export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => {}
  render () {
    return (
      <div>
        <h1>{{name|pascal}}</h1>
      </div>
    )
  }
}

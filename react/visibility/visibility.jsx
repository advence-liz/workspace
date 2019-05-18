import React from 'react'
import visibilityManager, { Task } from './visibilityChangWrap'
export default class App extends React.Component {
  status = []
  state = {
    status: []
  }
  task = new Task(()=>{
    
  })
  componentDidMount () {


    document.addEventListener('visibilitychange', () => {
      const isHidden = document.hidden
      const item = `document: ${
        document.visibilityState
      } ${new Date().toString()}`

      this.status.push(item)
      this.setState({ status: this.status })
      document.title = isHidden ? '点回去' : 'visibility'
      // Modify behavior...
    })
  }
  render () {
    const { status } = this.state
    return (
      <div>
        <h1>visibility</h1>
        {status.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    )
  }
}

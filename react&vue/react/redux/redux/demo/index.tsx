import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Redux from '../index'

class ReduxDemo extends React.Component {
  state = {}

  render() {
    return (
      <div>
        <Redux>primary</Redux>
      
      </div>
    )
  }
}

ReactDOM.render(<ReduxDemo />, document.getElementById('root'))

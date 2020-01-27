import React from 'react'
import ReactDOM from 'react-dom'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import vm from './viewModel'

var timerData = observable({
  secondsPassed: 0
})

setInterval(() => {
  timerData.secondsPassed++
}, 1000)

// A hooks based component wrapped with `timerData` will react to changes automatically
// const Timer = observer(({ timerData }) => <span>Seconds passed: {timerData.secondsPassed} </span>)

// Alternatively, a class based component:
@observer
class Timer extends React.Component {
  render() {
    return (
      <div>
        <span>Seconds passed: {this.props.timerData.secondsPassed} </span>
        <div>vm._data.v:{vm._data.v}</div>
        <div>{vm._data.deep.v}</div>
        <button
          onClick={() => {
            vm.plus()
          }}
        >
          v + 1
        </button>
      </div>
    )
  }
}

ReactDOM.render(<Timer timerData={timerData} />, document.body)

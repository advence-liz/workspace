import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Slider from '../index'

class SliderDemo extends React.Component {
  state = {}
  onTounchMove = event => {
    const { changedTouches: touches } = event
    const [touch] = touches
    console.dir(touch)
  }
  render() {
    return (
      <div style={{ padding: 20, background: '#3AC2B6' }}>
        <h1 style={{ textAlign: 'center', padding: '22px 0' }}>
          Slider With Controller
        </h1>
        <Slider controller={true} min={100} max={500} value={100} step={10} />
        <h1 style={{ textAlign: 'center', padding: '22px 0' }}>
          Slider Without Controller
        </h1>
        <Slider controller={false} min={100} max={500} value={100} step={10} />
      </div>
    )
  }
}

ReactDOM.render(<SliderDemo />, document.getElementById('root'))

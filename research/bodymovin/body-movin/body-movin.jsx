import React from 'react'
import bodymovin from './lottie'

export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => { }
  componentDidMount () {
    const animation = bodymovin.loadAnimation({
      container: document.getElementById('bm'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: './asserts/data.json'
    })
  }
  render () {
    return (
      <div>
        <div id="bm"> </div>
      </div>
    )
  }
}

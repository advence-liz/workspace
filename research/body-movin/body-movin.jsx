import React from 'react'

export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => {}
  componentDidMount () {
    var animation = bodymovin.loadAnimation({
      container: document.getElementById('bm'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'data.json'
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

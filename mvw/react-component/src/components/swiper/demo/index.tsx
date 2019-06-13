import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Swiper from '../index'

class SwiperDemo extends React.Component {
  state = {}

  render() {
    return (
      <div>
        <Swiper>primary</Swiper>
      
      </div>
    )
  }
}

ReactDOM.render(<SwiperDemo />, document.getElementById('root'))

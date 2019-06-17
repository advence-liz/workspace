import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Swiper from '../index'

class SwiperDemo extends React.Component {
  state = {}

  render () {
    const itemStyle: React.CSSProperties = {
      textAlign: 'center',
      background: 'gray',
      color: 'red',
      fontSize: 50,
      height:'100%'
    }
    return (
      <div>
        <Swiper width={300} height={200}>
          <div className="q-swiper__item">
            <div style={itemStyle}>1</div>
          </div>
          <div className="q-swiper__item">
            <div style={itemStyle}>2</div>
          </div>
          <div className="q-swiper__item">
            <div style={itemStyle}>3</div>
          </div>
          <div className="q-swiper__item">
            <div style={itemStyle}>4</div>
          </div>
        </Swiper>
      </div>
    )
  }
}

ReactDOM.render(<SwiperDemo />, document.getElementById('root'))

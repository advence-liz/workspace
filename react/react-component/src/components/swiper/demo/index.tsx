import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Swiper from '../index'
const { SwiperItem } = Swiper
class SwiperDemo extends React.Component {
  state = {}

  render () {
    const itemStyle: React.CSSProperties = {
      textAlign: 'center',
      background: 'gray',
      color: 'red',
      fontSize: 50,
      height: '100%'
    }
    return (
      <div>
        <Swiper width={300} height={200}>
          <SwiperItem>
            <div style={itemStyle}>1</div>
          </SwiperItem>
          <SwiperItem>
            <div style={itemStyle}>2</div>
          </SwiperItem>
          <SwiperItem>
            <div style={itemStyle}>3</div>
          </SwiperItem>
          <SwiperItem>
            <div style={itemStyle}>4</div>
          </SwiperItem>
        </Swiper>
      </div>
    )
  }
}

ReactDOM.render(<SwiperDemo />, document.getElementById('root'))

import '../../base'
import React from 'react'
import { observer } from '../../base/observerProps'
import IBaseProps from '../../base/baseProps'
import classNames from 'classnames'
import './style.scss'

export interface ISwiperProps extends IBaseProps {}
/**
 * Button
 * @prop {string} className Swiper的类名
 * @prop {object} style 定义Swiper样式
 * @example
 * import Swiper, { ISwiperProps } from 'q-react'
 *    let props:ISwiperProps ={ name:'ts-Swiper' }
 *    <Swiper {...props} />
 */
@observer(['disabled'])
export default class Swiper extends React.Component<ISwiperProps, any> {
  static defaultProps = {}

  state = { originX: 0, endX: 0, index: 0, animation: {} }
  get classNames () {
    const { className } = this.props
    return classNames('q-swiper', className)
  }
  // translateX = () => {
  //   const { translateX } = this.state
  //   console.log(1)
  //   this.setState({ translateX: '-100%' })
  // }
  animation (from = 0, to: number, duration = 300) {
    let translateX = to - from
    return {
      transform: `translate(${translateX}px)`,
      transition: `${duration}ms transform`
    }
  }
  onTouchStart = event => {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX, clientY } = touch
    this.setState({ originX: clientX })
  }
  onTouchEnd = event => {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX: endX, clientY } = touch

    let { originX, index } = this.state
    if (endX - originX < -50) {
      index++
    }
    if (endX - originX > 50) {
      index--
    }
    
    this.setState({ endX, index, animation: this.animation(0, -200 * index) })
    if(index===6-1){
      setTimeout(()=>{
      this.setState({index:1,animation:this.animation(0,-200,0)})
      },300)
    }
    // if(index===0){
    //   setTimeout(()=>{
    //   this.setState({index:6-1,animation:this.animation(0,-200*4,0)})
    //   },300)
    // }
  }
  onTouchMove = event => {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX, clientY } = touch
    let { originX, index } = this.state
    let translateX = clientX - originX - 200 * index

    this.setState({ animation: this.animation(0, translateX, 0) })
  }
  render () {
    const { style, children } = this.props
    const { animation, index } = this.state
    return (
      <div>
        <div className="q-swiper__wrap">
          <div
            className={this.classNames}
            style={animation}
            onTouchStart={this.onTouchStart}
            onTouchEnd={this.onTouchEnd}
            onTouchMove={this.onTouchMove}
          >
            <div className="q-swiper__item">3</div>
            <div className="q-swiper__item">0</div>
            <div className="q-swiper__item">1</div>
            <div className="q-swiper__item">2</div>
            <div className="q-swiper__item">3</div>
            <div className="q-swiper__item">0</div>
          </div>
        </div>
        <h1>index:{index}</h1>
      </div>
    )
  }
}

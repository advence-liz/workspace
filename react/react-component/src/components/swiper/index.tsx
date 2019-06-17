import '../../base'
import React from 'react'
import { observer } from '../../base/observerProps'
import IBaseProps from '../../base/baseProps'
import classNames from 'classnames'
import './style.scss'

export interface ISwiperProps extends IBaseProps {
  width: number
  height:number
}
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
  static defaultProps = {
    index: 1,
    width: 200
  }
  constructor (props) {
    super(props)
    const { index, children = [],width } = props
    this.state.animation = this.animation(0, -1 * width * index, 0)
    this.state.index = index
  }
  $swiper: any = React.createRef()
  state = { originX: 0, endX: 0, index: 0, animation: {}, len: 0 }
  get classNames () {
    const { className } = this.props
    return classNames('q-swiper', className)
  }
  /**
   *
   * @param from
   * @param to
   * @param duration 本来想根据当前滚动距离动态的计算 duration 但是看实际效果感觉不根据滚动距离控制during也没啥问题
   */
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
    const {width } = this.props
    let { originX, index } = this.state
    let nextIndex = index
    if (endX - originX < -20) {
      nextIndex = ++index
    }
    if (endX - originX > 20) {
      nextIndex = --index
    }

    this.setState({
      endX,
      index: nextIndex,
      animation: this.animation(0, -1 * width * index)
    })
    if (nextIndex === this.len + 1) {
      setTimeout(() => {
        this.setState({ index: 1, animation: this.animation(0, -1 * width, 0) })
      }, 300)
    }
    if (nextIndex === 0) {
      setTimeout(() => {
        this.setState({
          index: this.len,
          animation: this.animation(0, -1 * width * this.len, 0)
        })
      }, 300)
    }
  }
  onTouchMove = event => {
    const { changedTouches: touches } = event
    const touch = touches[0]
    const { clientX, clientY } = touch
    const {width} = this.props

    let { originX, index } = this.state
    // 这里translateX没有设置阙值，使用swiper的时候正常只能一次滑动一格
    let translateX = clientX - originX - width  * index

    this.setState({ animation: this.animation(0, translateX, 0) })
  }
  get len () {
    // 三种情况 undefined ， react.element , array
    const { children } = this.props
    if (!children) return 0
    return (children as any).length || 1
  }
  get rect () {
    const $swiper = this.$swiper.current
    const rect = $swiper.getClientRects()[0]
    return JSON.parse(JSON.stringify(rect))
  }
  get children () {
    const { children=[] } = this.props
    let newChildren :any[] = []
    if (this.len === 0) return
    if (this.len === 1) {
      newChildren =  new Array(3).fill(children, 0, 3)
    }
    newChildren.push(children[this.len - 1], ...children, children[0])
    return React.Children.toArray(newChildren)
  }
  componentDidMount () {
    this.setState({ rect: this.rect })
  }
  render () {
    const { style, children,width,height } = this.props
    const { animation, index } = this.state
    return (
      <div>
        <div className="q-swiper__wrap" style={{width,height}}>
          <div
            ref={this.$swiper}
            className={this.classNames}
            style={{ ...animation,height,...style }}
            onTouchStart={this.onTouchStart}
            onTouchEnd={this.onTouchEnd}
            onTouchMove={this.onTouchMove}
          >
            {this.children}
          </div>
        </div>
        <h1>index:{index}</h1>
      </div>
    )
  }
}

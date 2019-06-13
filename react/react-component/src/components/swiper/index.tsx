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
  static defaultProps = {
    style: {}
  }

  state = { disabled: false, translateX: '' }
  get classNames () {
    const { className } = this.props
    return classNames('q-swiper', className)
  }
  translateX = () => {
    const { translateX } = this.state
    console.log(1)
    this.setState({ translateX: '-100%' })
  }

  render () {
    const { style, children } = this.props
    const { translateX } = this.state
    return (
      <div>
        <button onClick={this.translateX}>translateX</button>
        <div className="q-swiper__wrap">
          <div
            className={this.classNames}
            style={{
              transform: `translate(${translateX})`,
              transition: '0s transform'
            }}
          >
            <div className="q-swiper__item">1</div>
            <div className="q-swiper__item">2</div>
            <div className="q-swiper__item">3</div>
            <div className="q-swiper__item">4</div>
          </div>
        </div>
      </div>
    )
  }
}

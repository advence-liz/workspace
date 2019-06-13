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
    style: {},
  }

  state = { disabled: false }
  get classNames() {
    const { className } = this.props
    return classNames(
      'q-swiper',
      className
    )
  }
  private onClick = (event: any) => {
    if (this.props.onClick(event)) event.stopPropagation()
  }
  render() {
    const { style, children } = this.props
    return (
      <div className={this.classNames} style={style} onClick={this.onClick}>
        {children}
      </div>
    )
  }
}

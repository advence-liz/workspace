import  '../../base'
import React from 'react'
import { observer } from '../../base/observerProps'
import IBaseProps from '../../base/baseProps'
import classNames from 'classnames'
import './style.scss'

export interface ISwiperItemProps extends IBaseProps {
}
/**
 * Button
 * @prop {string} className SwiperItem的类名
 * @prop {object} style 定义SwiperItem样式
 * @example
 * import SwiperItem, { ISwiperItemProps } from 'q-react'
 *    let props:ISwiperItemProps ={ name:'ts-SwiperItem' }
 *    <SwiperItem {...props} />
 */
export default class SwiperItem extends React.Component<ISwiperItemProps, any> {
  
  render () {
    const {children} = this.props
    return (
      <div className={classNames('q-swiper__item')}>{children}</div>
    )
  }
}

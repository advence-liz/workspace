import '../../base'
import React from 'react'
import observerProps, { observer } from '../../base/observerProps'
import classNames from 'classnames'
import './iconfont.js'
import './style.less'
import IBaseProps from '../../base/baseProps'
import { iconType } from './iconType'

export interface IIconProps extends IBaseProps {
  type: iconType
  onClick?: (e: any) => any
}
/**
 * Icon
 * @prop {string} className Icon的类名
 * @prop {boolean} disabled 禁用
 * @prop {} height desc
 * @example
 * import Icon, { IIconProps } from 'q-react'
 *    let props:IIconProps ={ name:'ts-Icon' }
 *    <Icon {...props} />
 */
// @observer(['disabled'])
export default class Icon extends React.Component<IIconProps, any> {
  static defaultProps = {
    disabled: false,
    style: {},
    type: 'duigou'
  }
  get type() {
    const { type } = this.props
    return type.replace(/[A-Z]/g, match => {
      return `_${match.toLowerCase()}`
    })
  }
  render() {
    const iconStyle = {
      width: '1em',
      height: '1em',
      verticalAlign: '-0.15em',
      fill: 'currentColor',
      overflow: 'hidden'
    }
    const { type, style, className } = this.props
    return (
      <svg
        className={classNames('icon', className)}
        style={{ ...iconStyle, ...style }}
        aria-hidden="true"
        onClick={this.props.onClick}
      >
        <use xlinkHref={`#icon${this.type}`} />
      </svg>
    )
  }
}

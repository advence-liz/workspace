import '../../base'
import React from 'react'
import { observer } from '../../base/observerProps'
import classNames from 'classnames'
import IBaseProps from '../../base/baseProps'
import './style.scss'

export interface IPasswordProps extends IBaseProps {
  disabled?: boolean
  value?: number
  type?: 'default' | 'primary'
  onChange?: (val: string) => void
  submit?: (val: string) => void
}
// https://www.jianshu.com/p/58194a78a051
const KeyCodeMap = {
  BackSpace: 8,
  Delete: 46,
  Enter: 13
}
let seed = 0
/**
 * Password
 * @prop {string} className Password的类名
 * @prop {object} style 定义Password样式
 * @prop {boolean} disabled 是否禁用
 * @prop {object} type Password的类型
 * @prop {function} onClick 点击Password时触发的回调
 * @example
 * import Password, { IPasswordProps } from 'q-react'
 *    let props:IPasswordProps ={ name:'ts-Password' }
 *    <Password {...props} />
 */
@observer(['disabled', 'value'])
export default class Password extends React.Component<IPasswordProps, any> {
  static defaultProps = {
    disabled: false,
    value: '',
    onChange() {},
    submit() {}
  }
  seed: number
  constructor(props) {
    super(props)
    this.seed = seed++
  }
  onInputChange = event => {
    const {
      target: { value }
    } = event
    const { onChange = () => {} } = this.props
    // 限制只能输入6位密码
    const newValue = value.slice(0, 6)
    this.setState({ value: newValue })
    onChange(newValue)
  }
  onInputKeyDown = event => {
    const { value } = this.state
    const { submit = () => {} } = this.props
    const { keyCode } = event
    const del = [KeyCodeMap.Enter]
    if (del.includes(keyCode)) {
      submit(value)
    }
  }
  state = { disabled: false, value: '' }

  get cells() {
    const { value } = this.state
    console.log('value', value)
    const valueLength = ~~value.length
    const cells = new Array(6)
    cells.fill('*', 0, valueLength)
    cells.fill('', valueLength, 6)
    return cells.map((item, i) => (
      <div key={`cell-${i}`} className="q-password__cell">
        {!!item && <div className="q-password__cell__dot" />}
      </div>
    ))
  }
  render() {
    const { style, className } = this.props
    const { value } = this.state
    return (
      <div className="q-password__wrap">
        <div className={classNames('q-password', className)} style={style}>
          {this.cells}
        </div>
        <label
          htmlFor={`password_-_${this.seed}`}
          className="q-password__label"
        />
        <input
          id={`password_-_${this.seed}`}
          className="q-password__input"
          value={value}
          // type="password"
          // type="number"
          type="tel"
          // maxLength={6} // number 和 maxLength配合无效
          // max={999999}
          onChange={this.onInputChange}
          onKeyDown={this.onInputKeyDown}
        />
      </div>
    )
  }
}

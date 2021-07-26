import React from 'react'
import classNames from 'classnames'
import './style.scss'

export interface IReduxProps extends IBaseProps {}

export default class Redux extends React.Component<IReduxProps, any> {
  static defaultProps = {
    style: {},
  }

  state = { disabled: false }
  render() {
    const { style, children } = this.props
    return (
     <div>hellow</div>
    )
  }
}

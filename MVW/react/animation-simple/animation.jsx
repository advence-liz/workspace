import React from 'react'
import { CSSTransition } from 'react-transition-group'

let count = 0
export default class Animation extends React.Component {
  static defaultProps = {
    in: true,
    timeout: 1000,
    unmountOnExit: true,
    classNames: '',
    onEnter () {},
    onEntered () {},
    onExit () {},
    onExited () {}
  }
  constructor () {
    super()
    this.count = count++
  }
  onEnter = () => {
    console.time(`enter${this.count}`)
    this.props.onEnter()
  }
  onEntered = () => {
    console.timeEnd(`enter${this.count}`)
    this.props.onEntered()
  }
  onExit = () => {
    console.time(`exit${this.count}`)
    this.props.onExit()
  }
  onExited = () => {
    console.timeEnd(`exit${this.count}`)
    this.props.onExited()
  }
  get children () {
    const { children, timeout } = this.props
    let currentChildren = children
    // 发现个小问题同样的动画效果 children 为function 时比 children DOM 慢一一丢
    if (children.constructor !== Function) {
      const {
        props: { className = '', style = {} }
      } = children

      currentChildren = React.cloneElement(children, {
        className: `animated ${className}`,
        style: {
          ...{
            '--webkit-animation-duration': `${timeout}ms`,
            animationDuration: `${timeout}ms`
          },
          ...style
        }
      })
    }

    return currentChildren
  }

  render () {
    const { in: isIn, timeout, unmountOnExit, classNames } = this.props

    return (
      <CSSTransition
        in={isIn}
        timeout={timeout}
        unmountOnExit={unmountOnExit}
        classNames={classNames}
        onEnter={this.onEnter}
        onEntered={this.onEntered}
        onExit={this.onExit}
        onExited={this.onExited}
      >
        {this.children}
      </CSSTransition>
    )
  }
}

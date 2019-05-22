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

  render () {
    const {
      in: isIn,
      timeout,
      unmountOnExit,
      classNames,
      children
    } = this.props
    const {
      props: { className = '', style = {} }
    } = children

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
        {React.cloneElement(children, {
          className: `animated ${className}`,
          style: {
            ...{
              '--webkit-animation-duration': `${timeout}ms`,
              animationDuration: `${timeout}ms`
            },
            ...style
          }
        })}
      </CSSTransition>
    )
  }
}

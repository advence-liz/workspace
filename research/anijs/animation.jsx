import React from 'react'
import { CSSTransition } from 'react-transition-group'

export default class Animation extends React.Component {
  static defaultProps = {
    in: true,
    timeout: 500,
    unmountOnExit: true,
    classNames: ''
  }

  toggle = () => {
    const { fadeIn } = this.state
    this.setState({ fadeIn: !fadeIn })
  }
  onEnter = () => {
    console.time('enter')
  }
  onEntered = () => {
    console.timeEnd('enter')
  }

  onExit = () => {
    console.time('exit')
  }
  onExited = () => {
    console.timeEnd('exit')
  }

  render() {
    const {
      children,
      children: {
        props: { className = '', style = {} }
      },
      in: isIn,
      timeout,
      unmountOnExit,
      classNames
    } = this.props

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
            ...style,
            ...{
              fontSize: 24,
              '--webkit-animation-duration': `${timeout}ms`,
              animationDuration: `${timeout}ms`
            }
          }
        })}
      </CSSTransition>
    )
  }
}

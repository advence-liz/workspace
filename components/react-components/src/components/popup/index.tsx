import '../../base'
import React from 'react'
import classNames from 'classnames'
import './style.scss'
import IBaseProps from '../../base/baseProps'
import Animation from '../animation'
/**
 * popup
 * @prop {boolean}  visible 显示/隐藏
 * @prop {boolean}  mask 是否显示蒙层，默认显示
 * @prop {boolean}  maskClosable 点击蒙层是否关闭
 * @prop {string}   animation 动画效果
 * @prop {string}   position 内容位置
 * @prop {function} onClose maskClosable = true 时，点击蒙层触发此函数
 * @example
 */

export interface IPopupProps extends IBaseProps {
  visible: boolean;
  position?: string; // 'center' | 'top' | 'right' | 'left' | 'bottom';
  animation?: string; // 'slide' | 'zoom' | 'drop';
  maskClosable?: boolean;
  mask?: boolean;
  onClose?: () => void;
}

export default class Popup extends React.Component<
  IPopupProps,
  any
  > {
  static defaultProps = {
    mask: true,
    maskClosable: false,
    position: 'center',
    animation: 'zoom',
    onClose() {}
  }

  onClose = () => {
    this.props.onClose()
  }

  maskClick = () => {
    const {
      maskClosable
    } = this.props

    // tslint:disable-next-line:no-unused-expression
    maskClosable && this.onClose()
  }

  render() {
    const { visible, mask, children, className, position, animation, style } = this.props
    return (
      <Animation in={visible}>
        <div className={classNames('q-popup', className, `q-popup--${position}`)} style={style}>
          {
            mask && (
              <Animation in={mask && visible} classNames='fade-animation'>
                <div className="q-popup__mask" onClick={this.maskClick} />
              </Animation>
            )
          }
          <Animation in={visible} classNames={classNames(`${animation}-animation`)}>
            <div className="q-popup__container">
              {children}
            </div>
          </Animation>
        </div>
      </Animation>
    )
  }
}

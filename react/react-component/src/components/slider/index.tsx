import '../../base'
import React from 'react'
import { observer } from '../../base/observerProps'
import IBaseProps from '../../base/baseProps'
import classNames from 'classnames'
import Icon from '../icon'
import './style.scss'
export interface ISliderProps extends IBaseProps {
  min?: number
  max?: number
  step?: number
  value?: number
  disabled: boolean
  onChange?: (val: number) => void
  onComplete?: (val: number) => void
  controller: boolean
}

@observer(['min', 'max', 'step', 'value'])
export default class Slider extends React.Component<ISliderProps, any> {
  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    onChange(val) {
      // console.log(val)
    },
    onComplete() {},
    controller: true,
  }

  $slider: any = React.createRef()

  oldValue: number = 0

  state = {
    step: 1,
    value: 0,
    max: 100,
    min: 0,
  }

  get percentage() {
    const { value, min } = this.state
    let offset = value - min
    if (offset < 0) offset = 0
    return this.convert2Precentage(offset / this.range)
  }
  get range() {
    const { max, min } = this.props
    return max - min
  }
  get rect() {
    const $slider = this.$slider.current
    const rect = $slider.getClientRects()[0]
    return JSON.parse(JSON.stringify(rect))
  }
  onTounchMove = event => {
    if (this.props.disabled) return

    const { changedTouches: touches } = event
    const { step, min, value: oldValue } = this.state
    const touch = touches[0]
    const { clientX, clientY } = touch
    const { left, width } = this.rect
    let currentOffsetLeft = (clientX - left) as number
    if (currentOffsetLeft < 0) currentOffsetLeft = 0
    if (currentOffsetLeft > width) currentOffsetLeft = width
    const percentage = this.convert2Precentage(currentOffsetLeft / width)
    const accurateValue: any = (this.range * currentOffsetLeft) / width / step
    const value = parseInt(accurateValue, 10) * step + min

    this.setState({
      percentage,
      value,
    })
    if (value !== oldValue) this.props.onChange(value)
  }
  onTouchStart = () => {
    this.setOldValue()
  }
  convert2Precentage(num: number): string {
    return Math.round(num * 10000) / 100 + '%'
  }
  setOldValue = () => {
    this.oldValue = this.state.value
  }
  // Element.getClientRects()  看起可以获得所有要用的属性
  // get sliderOffsetLeft() {
  //   const $slider = this.$slider.current
  //   let actualLeft = $slider.offsetLeft
  //   let current = $slider.offsetParent

  //   while (current !== null) {
  //     actualLeft += current.offsetLeft
  //     current = current.offsetParent
  //   }

  //   return actualLeft
  // }

  onChange = step => {
    const { disabled, onChange, onComplete } = this.props

    if (disabled) return
    const { max, min, value: oldValue } = this.state
    // @ts-ignore
    let value = parseFloat(oldValue) + parseFloat(step)
    if (value > max) value = max
    if (value < min) value = min

    this.setState({ value })
    if (value !== oldValue) {
      onChange(value)
      onComplete(value)
    }
  }

  onComplete = () => {
    const { disabled, onComplete } = this.props

    if (disabled) return
    const { value } = this.state

    if (this.oldValue !== value) onComplete(value)
  }

  componentDidMount() {
    this.setState({ rect: this.rect })
  }

  render() {
    const { step } = this.state
    const { controller } = this.props
    return (
      <div className='q-slider'>
        {controller && (
          <Icon
            className='q-slider__icon'
            type='less'
            onClick={this.onChange.bind(this, -1 * step)}
            style={{ fontSize: '22px', marginRight: '15px', fill: '#ffffff' }}
          />
        )}
        <div className='q-slider__wrapper' ref={this.$slider}>
          {/* <div className="slider__step" /> */}
          <div className='q-slider__rail' />
          <div className='q-slider__track' style={{ width: this.percentage }} />
          <div
            className='q-slider__handler'
            onTouchStart={this.onTouchStart}
            onTouchMove={this.onTounchMove}
            onTouchEnd={this.onComplete}
            style={{ left: this.percentage }}
          >
            <Icon type='slide' style={{ fontSize: '22px' }} />
          </div>
        </div>
        {controller && (
          <Icon
            className='q-slider__icon'
            type='add'
            onClick={this.onChange.bind(this, step)}
            style={{ fontSize: '22px', marginLeft: '15px', fill: '#ffffff' }}
          />
        )}
      </div>
    )
  }
}

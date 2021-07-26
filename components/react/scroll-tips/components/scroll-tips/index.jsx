import React, { Component } from 'react'
import './styles.scss'
const listDefault = new Array(12).fill({
  userAvatarUrl: 'xxx',
  lefttext: 'm***2抽中',
  centre: '88元',
  righttext: '现金'
})

export default class ScrollTips extends Component {
  static defaultProps = {
    visible: false,
    onClose() {},
    type: 0
  }

  timer = null
  state = {
    list: [],
    defaultAvatar: 'xx',
    animateUp: false,
    timer: null,
    visible: false
  }
  constructor(props) {
    super(props)
    this.state.list = listDefault
  }
  render() {
    const { list, animateUp, defaultAvatar, visible } = this.state

    const listItems = list.map(item => (
      <div className="scroll-tips__item" key={item.id}>
        <div
          className="avatar"
          style={{
            backgroundImage: `url(${item.userAvatarUrl || defaultAvatar})`
          }}
        ></div>
        <div>
          {item.lefttext}
          <span style={{ color: '#fffe00' }}>{item.centre}</span>
          {item.righttext}
        </div>
      </div>
    ))
    return (
      <div className="scroll-tips">
        <div className={`${animateUp ? 'animate-up' : ''}`}>{listItems}</div>
      </div>
    )
  }
  show = () => {
    this.setState({ visible: true })
  }
  hidden = () => [this.setState({ visible: false })]
  scrollAnimate = () => {
    const { list } = this.state
    if (list.length <= 1) return
    this.setState({ animateUp: true })
    setTimeout(() => {
      list.push(list[0])
      list.shift()
      const animateUp = false
      this.setState({ list, animateUp })
    }, 600)
  }
  componentWillUnmount() {
    clearInterval(this.timer)
  }
  componentDidMount() {
    this.timer = setInterval(this.scrollAnimate, 2000)
  }
}

# animation

最近对前端动画方案做了一些调研，想找到一个简单且易复制的方案在React组件中使用(也就是用复制粘贴解决80%的问题），最终选择官方的[react-transition-group](http://reactcommunity.org/react-transition-group/css-transition)加[animate.css](https://daneden.github.io/animate.css/)

## 我调研过的方案

- [anijs](https://daneden.github.io/animate.css/) [online demo](https://codepen.io/darielnoel/pen/trnzk?editors=1000) 酷炫是很酷炫但是引用方式比较原始不太适合现在的前端构建流程和React
- [velocity.js](http://velocityjs.org/) 用jQuery $.animate() 相同的API 但是可以不依赖 jQuery,这方式并不是我所期望的故放弃
- [react-motion](https://github.com/chenglou/react-motion) 非常酷炫如果要做复杂动画目前来看非它莫属，但是于我简单易复制的期望不符
- [animate.css](https://daneden.github.io/animate.css/) 用css 实现了各种常见的动画效果，而且还有人封装了[react-animated-css](https://github.com/digital-flowers/react-animated-css)
- [react-transition-group](http://reactcommunity.org/react-transition-group/css-transition) 官方的方案容易上手，但是应对复杂动画比较无力，可是我并不做复杂的动画因此这也就是心中的完美方案
  
## 关于CSS动画

本文并不打算介绍 CSS 动画但是推荐一些资源，如果你对CSS 动画比较陌生也先阅读下面的资源
  
- [CSS动画简介-阮一峰](http://www.ruanyifeng.com/blog/2014/02/css_transition_and_animation.html)
- [支持动画属性列表-MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_animated_properties)
- [animationendEvent](https://www.quanzhanketang.com/jsref/event_animationend.html)监听动画是否结束，一个比较实用的功能就是类似fadeout 这种退场动画完全结束的时候删除对应的DOM结构
  
## animate.css

[animate.css](https://daneden.github.io/animate.css/) 是一个出色的样式库，提供了各种常用的CSS 动画效果,简易的例子如下基本见名知意这里就不做额外的解释了

```html
<div class="animated bounce delay-2s">Example</div>
```

不过大多数的时候我们必然不需要引入全部样式，甚至我们可能只想copy一个动画效果，在这里我fork 了一份 animate.css 然后在其构建的过程中添加了sourcemap方便copy

[带sourcemap的DEMO站点](https://advence-liz.github.io/animate.css/)打开控制台开启复制粘贴之旅

![an](http://img003.qufenqi.com/products/f7/11/f7116a7eddd4f275504826c3ea014904.png)

## 简单介绍一下react-transition-group 中的 CSSTransition

CSSTransiotn 会在动画的生命周期内为其指定的子元素添加代表其处于指定生命周期的`class`
假设有如下DEMO
当 `CSSTransition` 的 `in`属性值切换时`true`的时候会依次给`chidern` 添加 fade-enter, fade-enter-active, fade-enter-done。
当 `CSSTransition` 的 `in`属性值切换时`false`的时候会依次给`chidern` 添加 fade-exit, fade-exit-active, fade-exit-done。

其中 `-enter-active`紧随 `-enter`之后添加并且跟`-enter` 同时存在，而`-enter-done`在动画结束时添加并且与`-enter-active`和`enter`互斥，`exit`同理。

所以当我们要利用CSSTransition实现动画效果的时候，只需要定义出对应时间点出现的`class`样式即可，需要注意的俩点

- 动画结束的时间根据`timeout`决定所以所写的样式`during`必须跟与其对应(之后我们会对CSSTransition进行简单封装解决这个问题)
- `CSSTransition`决定前缀的参数是`classNames` 不是`className`

```jsx
    <CSSTransition
            in={fadeIn}
            timeout={2000}
            unmountOnExit
            classNames="fade"
            onEnter={this.onEnter}
            onEntered={this.onEntered}
            onExit={this.onExit}
            onExited={this.onExited}
          >
        <div className="demo" >fade-{fadeIn ? 'in' : 'out'}</div>
    </CSSTransition>
```

虽然在动画的执行的生命周期内出现了6个关键点但是使用`css3 animation`实现动画效果时我们只需操作俩个时间点 `-enter`和 `-exit`就ok了，之后要做的就是在`animate.css`copy 对应的代码

```less
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
.fade {
  &-enter {
    animation-name: fadeIn;
    animation-duration: 2000ms;
  }
  &-exit {
    animation-name: fadeOut;
    animation-duration: 2000ms;
  }
}
```

## 对CSSTransition 进行简单封装

利用`React.cloneElement`对为`CSSTransition` 默认添加 `animated` class,并且通过设置内联的样式的方式让动画效果结束的时间跟`timeout`字段一致

`animated`为了为动画设置一些默认的样式,比如像下面这样默认设置动画时长为`1s` `animation-fill-mode`为 `both`

```less
.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}
@media (print), (prefers-reduced-motion) {
  .animated {
    animation: unset !important;
    transition: none !important;
  }
}

```

### 封装代码示意

```jsx
import React from 'react'
import { CSSTransition } from 'react-transition-group'

let count = 0
export default class Animation extends React.Component {
  static defaultProps = {
    in: true,
    timeout: 1000,// 与 .animate 中设置的默认时间对应
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
```

## 在线 DEMO

[![Edit animation-simple](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3y24kvrz45?fontsize=14)
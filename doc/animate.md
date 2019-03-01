# animation

最近对前端动画方案做了一些调研，想找到一个简单且容易复制的方案，最终选择对官方的[react-transition-group](http://reactcommunity.org/react-transition-group/css-transition)加[animate.css](https://daneden.github.io/animate.css/)

## 我看过的库

- [anijs](https://daneden.github.io/animate.css/) [online demo](https://codepen.io/darielnoel/pen/trnzk?editors=1000) 酷炫是很酷炫但是引用方式比较原始不太适合现在的前端构建流程和React
- [velocity.js](http://velocityjs.org/) 用jQuery $.animate() 相同的API 但是可以不依赖 jQuery,这方式并不是我所期望的故放弃
- [react-motion](https://github.com/chenglou/react-motion) 非常酷炫如果要做复杂动画目前来看非它莫属，但是于我简单易负责的期望不符
- [animate.css](https://daneden.github.io/animate.css/) 用css 实现了各种常见的动画效果，而且还有人封装了[react-animated-css](https://github.com/digital-flowers/react-animated-css)
- [react-transition-group](http://reactcommunity.org/react-transition-group/css-transition) 官方的方案容易上手，但是应对复杂动画应该比较无力，可是我并不做复杂的动画因此这也就是心中的完美方案
  

## 简单介绍一下react-transition-group



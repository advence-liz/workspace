# css 动画


## animation 

CSS animation 属性是 
- animation-name
- animation-duration,
- animation-timing-function
- animation-delay
- animation-iteration-count
- animation-direction
- animation-fill-mode
- animation-play-state running paused

## 同时运行多个动画

### 借助::before ::after 伪类，获取嵌套 div 

限定元素大小的样式要写在最内部，其它的样式要包裹在基础DOM外包

```less
.box {
 
  animation: ty 3s linear;
  animation-iteration-count: infinite;
  // animation-fill-mode: backwards;
  transform-origin: center center;
  &::before {
    content: '';
    display: block;
    height: 200px;
    width: 200px;
    position: relative;
    background: red;
    animation: tx 3s linear;
    animation-iteration-count: infinite;
    // animation-direction: alternate;
    animation-fill-mode: backwards;
    transform-origin: center center;
  }
}
```
 
###  通过逗号分隔，delay 设置为 0  

当前一个动画为非位移，后一个为位移效果可以符合预期。
当前一个动画位移，后一个为非位移难以描述。
当俩个动画都是位移，一言难尽。


效果跟想象的不太一样，执行过程难以预期，收尾的时候以逗号后面的animation 为准。
`animation: tx 3s linear, ty 3s 0s linear;`


## 动画效果收藏

- [扫光效果](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation)
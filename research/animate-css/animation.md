# css 动画


## animation 

创建动画序列，需要使用 animation 属性或其子属性，该属性允许配置动画时间、时长以及其他动画细节，但该属性不能配置动画的实际表现，动画的实际表现是由 @keyframes 规则实现。

### [CSS animated properties](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_animated_properties)
### animation 的子属性有：

- animation-name：指定由 @keyframes 描述的关键帧名称。
- animation-duration：设置动画一个周期的时长。
- animation-delay：设置延时，即从元素加载完成之后到动画序列开始执行的这段时间，可以为负值。
- animation-direction：设置动画在每次运行完后是反向运行还是重新回到开始位置重复运行。
- animation-iteration-count：设置动画重复次数， 可以指定 infinite 无限次重复动画
- animation-play-state：允许暂停和恢复动画。
- animation-timing-function：设置动画速度， 即通过建立加速度曲线，设置动画在关键帧之间是如何变化。
- animation-fill-mode：指定动画执行前后如何为目标元素应用样式
- @keyframes 规则，当然，一个动画想要运行，还应该包括 @keyframes 规则，在内部设定动画关键帧


### 其中，对于一个动画：

必须项：animation-name、animation-duration 和 @keyframes规则
非必须项：animation-delay、animation-direction、animation-iteration-count、animation-play-state、animation-timing-function、animation-fill-mode
### [2D变换](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform)

- translate
- scale
- rotate
- skew
- matrix
##  animation 事件

注意单单词大小写

- animationstart，animationstart 监听动画开始
- animationend，webkitAnimationEnd 监听动画结束

```jsx
<div>
  v-on:webkitAnimationEnd="animationend"
  v-on:webkitAnimationStart="animationstart"
  v-on:animationstart="animationstart"        
  v-on:animationend="animationend"
</div>  
```
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

## [WebAnimations](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API)
## 动画效果收藏

- [扫光效果](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation)

## 参考文章
- [深入浅出CSS动画](https://segmentfault.com/a/1190000041275359?utm_source=sf-homepage)
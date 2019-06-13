# Animation

[心路历程](https://segmentfault.com/a/1190000018507616)

## 代码演示

```jsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Animation from '../index'
import Button from '../../button'

import './style.less'

class Example extends React.Component {
  state = {
    fadeIn: true,
    slideIn: true,
    zoomIn: true
  }
  toggleProxy = type => {
    this.toggle(type)
  }
  toggle = type => {
    this.setState({ [type]: !this.state[type] })
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
    const { fadeIn, slideIn, zoomIn } = this.state
    return (
      <div>
        <h1>animation </h1>

        <hr />

        <h2>animation fade</h2>
        <Button
          type="default"
          onClick={this.toggle.bind(this, 'fadeIn')}
          style={{ width: 100 }}
        >
          toggle
        </Button>
        <div className="demo-wrap">
          <Animation in={fadeIn} classNames="fade-animation">
            {
              <div className="demo">
                fade-
                {fadeIn ? 'in' : 'out'}
              </div>
            }
          </Animation>
        </div>

        <h2>animation slide</h2>
        <Button
          type="default"
          onClick={this.toggle.bind(this, 'slideIn')}
          style={{ width: 100 }}
        >
          toggle
        </Button>
        <div className="demo-wrap">
          <Animation in={slideIn} classNames="slide-animation">
            {
              <div className="demo slide">
                slide-
                {slideIn ? 'in' : 'out'}
              </div>
            }
          </Animation>
        </div>
        <h2>animation zoom</h2>
        <Button
          type="default"
          onClick={this.toggle.bind(this, 'zoomIn')}
          style={{ width: 100 }}
        >
          toggle
        </Button>
        <div className="demo-wrap">
          <div className="zoom__wrap">
            <Animation in={zoomIn} classNames="zoom-animation">
              {
                <div className="demo zoom">
                  zoom-
                  {zoomIn ? 'in' : 'out'}
                </div>
              }
            </Animation>
          </div>
        </div>
      </div>
    )
  }
}
ReactDOM.render(<Example />, document.getElementById('root'))


```

## API

| Option        | Description                  |  Type           | Default Value |
| :------------ | :--------------------------- | :---------------- | :------------ |
| in            | 动画开关                     | boolean           |               |
| timeout       | 动画持续时间                 | number            | 500           |
| unmountOnExit | 动画退场时移除DOM            | bool              | true          |
| appear        | 默认显示状态是否添加动画效果 | bool              | true          |
| classNames    | 动画效果对应的 name          | string `|` object |               |
| onEnter       | 生命周期回调                 | () => void        |               |
| onEntered       | 生命周期回调                 | () => void        |               |
| onExit    | 生命周期回调         | () => void|               |
| onExited    | 生命周期回调         | () => void|               |

<q-iframe name="animation"  />
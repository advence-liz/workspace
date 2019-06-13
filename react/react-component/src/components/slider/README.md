# Slider

滑块组件，用于范围取数值
包含两种

- controller = true => 携带左右的控制组件
- controller = false => 不携带控制组件

## 代码演示

```jsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Slider from '../index'

class SliderDemo extends React.Component {
  state = {}
  onTounchMove = event => {
    const { changedTouches: touches } = event
    const [touch] = touches
    console.dir(touch)
  }
  render() {
    return (
      <div style={{ padding: 20, background: '#3AC2B6' }}>
        <h1 style={{ textAlign: 'center', padding: '22px 0' }}>
          Slider With Controller
        </h1>
        <Slider min={100} max={500} value={100} step={10} />
        <h1 style={{ textAlign: 'center', padding: '22px 0' }}>
          Slider Without Controller
        </h1>
        <Slider controller={false} min={100} max={500} value={100} step={10} />
      </div>
    )
  }
}

ReactDOM.render(<SliderDemo />, document.getElementById('root'))
```

## API

| Option     | Description                           |  Type    | Default Value        |
| :--------- | :------------------------------------ | :------- | :------------------- |
| min        |  取值范围的最小值                     | number   | 0                    |
| max        | 取值范围的最大值                      | number   | 100                  |
| step       | 滑块每次移动的值增长步长              | number   | 1                    |
| disabled   | 是否禁用                              | boolean  | false                |
| onChange   | 滑块移动导致值改变后的回调函数        | function | (value:number) => {} |
| onComplete | touchStart->touchEnd 为 complete 操作 | function | (value:number) => {} |
| controller | 是否携带左右+/-操作按钮               | boolean  | true                 |

<q-iframe name="button"  />

# Icon

基础图标库。

## 代码演示

```jsx

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Icon, { IconType } from '../index'

const iconList: IconType[] = [
  'arrowRight',
  'arrowUnder',
  'arrowOn',
  'closePop',
  'navBack',
  'selectDownRadio',
  'navSearch',
  'selectUp',
  'warning',
  'success',
  'failure',
  'wait',
  'delete',
  'add',
  'less',
  'notice',
  'refresh',
  'close',
  'slide',
  'hot'
]
class IconDemo extends React.Component {
  state = {}

  render() {
    return (
      <div>
        <h3>icon</h3>

        <ul>
          {iconList.map((type, index) => (
            <li key={`icon-${index}`}>
              <Icon type={type} />
              <br />
              {type}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

ReactDOM.render(<IconDemo />, document.getElementById('root'))

```

## API

| Option   | Description    |  Type              | Default Value |
| :------- | :------------- | :------------------- | :------------ |
| type     | 图标类型       | IconType             | 'duigou'      |
| disabled | 是否禁用       | boolean              | false         |
| style    | 自定义行内样式 | object               | {}            |
| onClick  | 点击事件的回调 | (event: any) => void | {}            |

<q-iframe name="icon" />
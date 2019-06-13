import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Popup, { IPopupProps } from '../index'
import Button from '../../button'
import List from '../../list'
import Switch from '../../switch'
import '../../../base'
class Example extends React.Component {
  state = {
    visible: false,
    mask: true,
    animation: 'zoom',
    position: 'center',
    maskCloseable: true
  }

  toggle = (key: string) => {
    this.setState({ [key]: !this.state[key] })
  }
  toggleProxy = (key: string) => {
    this.toggle(key)
  }

  render() {
    const { visible, mask, maskCloseable, animation, position } = this.state

    return (
      <div>
        <Button onClick={this.toggleProxy.bind(this, 'visible')}>
          show
          {!mask && visible && '(没有mask也会有隐形的遮罩，依然无法点击)'}
        </Button>
        <Popup
          onClose={this.toggleProxy.bind(this, 'visible')}
          visible={visible}
          mask={mask}
          maskClosable={maskCloseable}
          position={position}
          animation={animation}
        >
          <div
            style={{
              height: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              backgroundColor: '#fff'
            }}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <Button onClick={this.toggleProxy.bind(this, 'visible')}>
              close
            </Button>
            内部内容完全之定义可以是`string`也可以是`JSX.Element`
          </div>
        </Popup>
        <List header="参数控制">
        <List.Item
            extra={
              <Switch
                onChange={this.toggleProxy.bind(this, 'visible')}
                checked={visible}
              />
            }
          >
            visible
          </List.Item>
          <List.Item
            extra={
              <Switch
                onChange={this.toggleProxy.bind(this, 'mask')}
                checked={mask}
              />
            }
          >
            mask
          </List.Item>
          <List.Item
            extra={
              <Switch
                onChange={this.toggleProxy.bind(this, 'maskCloseable')}
                checked={maskCloseable}
              />
            }
          >
            maskCloseable
          </List.Item>
        </List>
      </div>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('root'))

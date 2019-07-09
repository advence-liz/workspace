import React from 'react'
import { Simulate } from 'preact-test-utils'
// import Password from '../../../react-component/src/components/password'
console.log(Simulate)
export default class App extends React.Component {
  state = {
    show: false,
    name: 'liz',
    age: 1,
    password: 0
  }
  onChange = event => {
    const {
      target: { value, name }
    } = event
    this.setState({ [name]: value })
  }
  onPasswordChange = value => {
    this.setState({ password: value })
  }
  triggerError = () => {
    throw new Error('click error')
  }
  triggerInput = () => {
    // // 创建事件
    // var inputEvent = new InputEvent('input', {
    //   inputType: 'text',
    //   data: 'ee',
    //   bubbles: true,
    //   currentTarget: input
    // })
    // var input = document.getElementById('name')
    // input.dispatchEvent(inputEvent)

    const node = this.textInput
    node.value = 111
    var event = new Event('input')
    node.dispatchEvent(event)
    // Simulate.change(node)
  }
  componentDidMount () {
    var horde = gremlins.createHorde()

    var formFillerGremlin = gremlins.species.formFiller()
    var elementMapTypes = formFillerGremlin.elementMapTypes()
    // // var fillTextElement = elementMapTypes['input[type="text"]']
    var fillNumberElement = elementMapTypes['input[type="number"]']
    elementMapTypes['input[type="tel"]'] = fillNumberElement

    for (let key in elementMapTypes) {
      let originFiller = elementMapTypes[key]

      elementMapTypes[key] = element => {
        let value = originFiller(element)
        
        element.dispatchEvent(new Event('input'))
        // Simulate.change(element)

        return value
      }
    }
    formFillerGremlin.elementMapTypes(elementMapTypes)

    horde.gremlin(formFillerGremlin).unleash()
    // horde.unleash()
  }
  render () {
    const buttonStyle = {
      // height: 50,
      display: 'block',
      width: '100%'
      // background: 'red'
    }
    return (
      <div>
        <h1>Gremlins</h1>
        <button
          className="vc-switch"
          id="no"
          style={{ ...buttonStyle, ...{ background: 'red', height: 200 } }}
          onClick={this.triggerError}
        >
          11
        </button>
        <button
          style={buttonStyle}
          // onClick={this.triggerError}
          type="button"
          className="btn btn-primary"
        >
          22
        </button>
        <button style={buttonStyle} type="button" className="btn btn-primary">
          33
        </button>
        <button style={buttonStyle} type="button" className="btn btn-primary">
          44
        </button>
        <button style={buttonStyle} type="button" className="btn btn-primary">
          55
        </button>
        <button style={buttonStyle} type="button" className="btn btn-primary">
          66
        </button>
        <button
          style={buttonStyle}
          type="button"
          className="btn btn-primary"
          onClick={this.triggerInput}
        >
          trigger input
        </button>
        <input
          type="text"
          name="name"
          className="form-control"
          max={12}
          onChange={this.onChange}
          value={this.state.name}
        />
        <div>{this.state.name}</div>
        <input
          type="number"
          name="age"
          id="name"
          ref={node => (this.textInput = node)}
          className="form-control"
          max={20}
          onChange={this.onChange}
          value={this.state.age}
        ></input>
        <div>{this.state.age}</div>
        {/* <Password value={this.state.password} onChange = {this.onPasswordChange} name="password"></Password> */}
      </div>
    )
  }
}

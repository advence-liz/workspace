import React from 'react'
// import { Simulate } from 'preact-test-utils'
// import Password from '../../../react-component/src/components/password'
console.log(Simulate)
export default class App extends React.Component {
  state = {
    show: false,
    name: 'liz',
    age: 1,
    password: 0
  }
  handleInputChange = (event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    })
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
  handleUploadXhr = event => {
    var blob = new Blob([JSON.stringify({ name: 'liz' })])
    var url = URL.createObjectURL(blob)
    var xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:3003/upload', true)

    // define new form
    var formData = new FormData()
    formData.append('file', blob, 'someFileName.json')

    // action after uploading happens
    xhr.onload = function (e) {
      console.log('File uploading completed!')
    }

    // do the uploading
    console.log('File uploading started!')
    xhr.send(formData)
  }
  handleUploadFetch = () => {
    const file = document.getElementById('uploadfile')
    const fd = new FormData()
    fd.append('file', file.files[0])
    fetch('http://localhost:3003/upload', {
      method: 'POST',
      body: fd
    })
      .then(res => {
        if (res.ok) {
          console.log('success',res)
          return res
        } else {
          console.log('error')
        }
      })
  
    // define data and connections
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

    // horde.gremlin(formFillerGremlin).unleash()
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
          onChange={this.handleInputChange}
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
          onChange={this.handleInputChange}
          value={this.state.age}
        ></input>
        <div>{this.state.age}</div>
        <form>
          <label>
            参与:
            <input
              name="isGoing"
              type="checkbox"
              checked={this.state.isGoing}
              onChange={this.handleInputChange} />
          </label>
          <br />
          <label>
            来宾人数:
            <input
              name="numberOfGuests"
              type="radio"
              value={this.state.numberOfGuests}
              onChange={this.handleInputChange} />
            <input
              name="numberOfGuests"
              type="radio"
              value={this.state.numberOfGuests}
              onChange={this.handleInputChange} />
          </label>
        </form>
        {/* <Password value={this.state.password} onChange = {this.onPasswordChange} name="password"></Password> */}
        <h2>Input file form upload</h2>
        <form
          encType="multipart/form-data"
          method="post"
          action="http://localhost:3003/upload"
        >
          <input type="file" id="uploadfile" name="file" />
          <input type="submit" value="上传" />
        </form>
        <h2>fetch upload</h2>

        <button
          type="button"
          className="btn btn-primary"
          onClick={this.handleUploadXhr}
        >
          xhr upload
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.handleUploadFetch}
        >
          fetch upload
        </button>
      </div>
    )
  }
}

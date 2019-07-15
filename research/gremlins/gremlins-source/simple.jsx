import React from 'react'
// import { Simulate } from 'preact-test-utils'
// import Password from '../../../react-component/src/components/password'
import MultiPicker from './m-picker/src/MultiPicker'
import './m-picker/assets/index.less'
import Picker from './m-picker/src/Picker'
//  console.log(Simulate)
export default class App extends React.Component {
  state = {
    show: false,
    name: 'liz',
    clickCount: 0,
    password: 0,

    value: ['1', '11']
  }
  onChange = value => {
    console.log('onChange', value)
    this.setState({
      value
    })
  }
  handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }
  handleClick = event => {
    this.setState({ clickCount: ++this.state.clickCount })
  }
  onPasswordChange = value => {
    this.setState({ password: value })
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
    }).then(res => {
      if (res.ok) {
        console.log('success', res)
        return res
      } else {
        console.log('error')
      }
    })

    // define data and connections
  }
  componentDidMount () {}
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
          style={buttonStyle}
          type="button"
          className="btn btn-primary"
          onClick={() => {
            document.title = 'done'
          }}
        >
          done
        </button>
        <button
          style={buttonStyle}
          type="button"
          className="btn btn-primary"
          id="click-case"
          onClick={this.handleClick}
        >
          click test
        </button>
        <div>{this.state.clickCount}</div>
        <input
          type="text"
          name="name"
          className="form-control"
          max={12}
          id="input-case"
          onChange={this.handleInputChange}
          value={this.state.name}
        />
        <div>{this.state.name}</div>
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
        <div>
          {this.state.value[0]}
          {this.state.value[1]}
        </div>
        <div style={{ background: '#f5f5f9', padding: 10 }}>
          <MultiPicker
            selectedValue={this.state.value}
            onValueChange={this.onChange}
            onScrollChange={this.onScrollChange}
          >
            <Picker indicatorClassName="my-picker-indicator">
              <Picker.Item className="my-picker-view-item move-case" value="1" id="move-case">
                one
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="2">
                two
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="3">
                three
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="4">
                four
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="5">
                five
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="6">
                six
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="7">
                seven
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="8">
                eight
              </Picker.Item>
            </Picker>
            <Picker indicatorClassName="my-picker-indicator">
              <Picker.Item className="my-picker-view-item" value="11">
                eleven
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="12">
                twelve
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="13">
                thirteen
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="14">
                fourteen
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="15">
                fifteen
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="16">
                sixteen
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="17">
                seventeen
              </Picker.Item>
              <Picker.Item className="my-picker-view-item" value="18">
                eighteen
              </Picker.Item>
            </Picker>
          </MultiPicker>
        </div>
      </div>
    )
  }
}

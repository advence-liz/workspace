import React from 'react'
export default class App extends React.Component {
  state = {}

  handleUploadXhr = event => {
    var blob = new Blob([JSON.stringify({ name: 'liz' })])
    // var url = URL.createObjectURL(blob)
    var xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:3003/upload', true)

    // define new form
    var formData = new FormData()
    formData.append('file', blob, 'name.json')

    // action after uploading happens
    xhr.onload = function(e) {
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

  render() {
    return (
      <div>
        <h2>Input file form upload</h2>
        <form
          encType="multipart/form-data"
          method="post"
          action="http://localhost:3003/upload"
        >
          <input type="file" id="uploadfile" name="file" />
          <input type="submit" value="上传" />
        </form>
        <h2>xhr upload</h2>

        <button
          type="button"
          className="btn btn-primary"
          onClick={this.handleUploadXhr}
        >
          xhr upload
        </button>
        <h2>fetch upload</h2>
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

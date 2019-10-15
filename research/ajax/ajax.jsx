import React from 'react'
import axios from 'axios'
export default class App extends React.Component {
  state = {
    show: false
  }
  send = e => {
    // var xhr = new XMLHttpRequest()
    // xhr.open(
    //   'GET',
    //   'http://localhost:3000/get/book?name=liz&v=1',
    //   true
    // )
    // xhr.send(null)
    // axios
    //   .get('http://localhost:3000/get/book?name=liz&v=1')
    //   .then(function(response) {
    //     // console.log(response)
    //   })
    //   .catch(function(error) {
    //     // console.log(error)
    //   })

    axios
      .post('http://localhost:3000/get/book', { name: 'iiz' })
      .then(function(response) {
        // console.log(response)
      })
      .catch(function(error) {
        // console.log(error)
      })
  }
  render() {
    return (
      <div>
        <h1>Ajax</h1>
        <button onClick={this.send}>send book</button>
      </div>
    )
  }
}

import React from 'react'
import axios from 'axios'
export default class App extends React.Component {
  state = {
    show: false
  }
  get = e => {
   
    axios
      .get('http://localhost:3000/get/book')
      .then(function(response) {
        // console.log(response)
      })
      .catch(function(error) {
        // console.log(error)
      })
    axios
      .get('http://localhost:3000/get/book?name=liz')
      .then(function(response) {
        // console.log(response)
      })
      .catch(function(error) {
        // console.log(error)
      })
  }
  post = e => {
   
    axios
      .post('http://localhost:3000/get/book')
      .then(function(response) {
      // console.log(response)
      })
      .catch(function(error) {
      // console.log(error)
      })
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
        <button style={{display:'block',margin:10,background:'#fff'}} onClick={this.get}>send book</button>
        <button style={{display:'block',margin:10,background:'#fff'}} onClick={this.post}>send book</button>
      </div>
    )
  }
}

import React from 'react'
import ReactDOM from 'react-dom'
import App from './automation'
ReactDOM.render(<App />, document.getElementById('root'))
console.log(process.env.NODE_ENV)
window.addGremlins = function () {
  var head = document.getElementsByTagName('head')[0]

  var scripts = head.getElementsByTagName('script')
  var script = document.createElement('script')
  script.src = 'https://cdn.bootcss.com/gremlins.js/0.1.0/gremlins.min.js'
  // script.src ='https://cdn.bootcss.com/jquery/3.4.1/jquery.js'
  script.onload = () => {
    window.gremlins.createHorde().unleash()
  }
  head.appendChild(script)
}

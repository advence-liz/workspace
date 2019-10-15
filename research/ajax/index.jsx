import React from 'react'
import ReactDOM from 'react-dom'
import App from './ajax'
import axios from 'axios'
import './ajax-send.js'


ReactDOM.render(<App />, document.getElementById('root'))
console.log(process.env.NODE_ENV)

import React from 'react'
import ReactDOM from 'react-dom'
import App from './csrf'
ReactDOM.render(<App />, document.getElementById('root'))
console.log(process.env.NODE_ENV)

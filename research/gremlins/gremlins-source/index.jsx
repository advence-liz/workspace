import React from 'react'
import ReactDOM from 'react-dom'
import './src/main'
import App from './simple'
ReactDOM.render(<App />, document.getElementById('root'))
console.log(process.env.NODE_ENV)
// gremlins.createHorde().unleash();
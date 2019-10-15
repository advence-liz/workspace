import React from 'react'
import ReactDOM from 'react-dom'
import App from './ajax'
import axios from 'axios'
import './ajax-one'


// // 添加请求拦截器
// axios.interceptors.request.use(function (config) {
//   // 在发送请求之前做些什么
//   console.log('interceptors',config)
//   return config
// }, function (error) {
//   // 对请求错误做些什么
//   return Promise.reject(error)
// })
// axios.interceptors.response.use(function (response) {
//   // 对响应数据做点什么
//   console.log('interceptors',response)
//   return response
// }, function (error) {
//   // 对响应错误做点什么
//   return Promise.reject(error)
// })
ReactDOM.render(<App />, document.getElementById('root'))
console.log(process.env.NODE_ENV)

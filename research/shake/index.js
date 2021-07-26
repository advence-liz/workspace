import Vue from 'vue'
import App from './app.vue'
const VConsole = require('vconsole/dist/vconsole.min')
new VConsole()
new Vue({
  el: '#root',
  render: h => h(App)
})

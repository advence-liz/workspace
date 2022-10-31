import Vue from 'vue'
import App from './App.vue'
import VueLuckyCanvas from '@lucky-canvas/vue'
Vue.use(VueLuckyCanvas)
new Vue({
    el: '#root',
    render: (h) => h(App)
})

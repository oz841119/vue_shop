import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 全局樣式
import './assets/css/global.css'

// 0806 API接口可以使用
import axios from 'axios'
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

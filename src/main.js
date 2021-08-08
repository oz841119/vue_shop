import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 全局樣式
import './assets/css/global.css'

// 110.08.06 API接口可以使用
import axios from 'axios'
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 此API文檔中提到 需要授權的API 必須在請求頭中使用Authorization字段提供token令牌
axios.interceptors.request.use(config => { // 攔截
  config.headers.Authorization = window.sessionStorage.getItem('token') // 進行預處理 使headers掛載Authorization
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

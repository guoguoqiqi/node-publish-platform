import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import ElementUI from 'element-ui'
import 'ant-design-vue/dist/antd.css'
import 'element-ui/lib/theme-chalk/index.css'
import 'normalize.css/normalize.css'
import { commit } from './store/index'

Vue.use(ElementUI)
Vue.use(Antd)
Vue.config.silent = true
Vue.config.productionTip = false

// 获取用户信息
commit('token', localStorage.getItem('TOKEN'))
commit('userInfo', JSON.parse(localStorage.getItem('USER_INFO')))

new Vue({
	router,
	render: h => h(App),
}).$mount('#app')

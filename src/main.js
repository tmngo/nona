import Vue from 'vue'
import VueWorker from 'vue-worker'
import App from './App.vue'

Vue.use(VueWorker)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

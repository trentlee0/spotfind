import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import pinia from './store'
import router from './router'
import vuetify from './plugins/vuetify'
import toastification from './plugins/toastification'

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .use(toastification)
  .mount('#app')

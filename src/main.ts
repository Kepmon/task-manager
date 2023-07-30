import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'vue-select/dist/vue-select.css'
import vSelect from 'vue-select'

import App from './App.vue'
import router from './router'

import './index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// eslint-disable-next-line vue/component-definition-name-casing
app.component('v-select', vSelect)

app.mount('#app')

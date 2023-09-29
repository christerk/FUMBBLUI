import '../../style/main.less'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { LoadingPlugin } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
// @ts-ignore
import winrater from './winrater.vue'

const app = createApp(winrater)
const pinia = createPinia()

app.use(pinia)
app.use(LoadingPlugin)
app.mount('#app')

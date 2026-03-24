import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import i18next from './i18n' // 导入并初始化 i18n
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注入全局 i18n 方法
app.config.globalProperties.$t = (key: string, options?: any) => i18next.t(key, options)

// Store
const pinia = createPinia()
app.use(pinia)

// Router
app.use(router)

// UI Framework
app.use(ElementPlus)

app.mount('#app')

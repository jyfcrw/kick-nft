import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import urql from '@urql/vue'

import 'normalize.css/normalize.css'
import 'element-plus/dist/index.css'
import './assets/styles/application.scss'

import App from './App.vue'
import store from './store'
import router from './router'
import i18n from './locales'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/zh-cn'

const app = createApp(App)
app.use(ElementPlus, { size: 'medium', zIndex: 3000, i18n: i18n.global.t })
app.use(store)
app.use(i18n)
app.use(router)
app.use(urql, { url: import.meta.env.VITE_SUBGRAPH_QUERY_URL })
app.mount('#app')

// dayjs locale should place after using ElementPlus
dayjs.extend(localizedFormat)
dayjs.locale('en')


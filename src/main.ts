import { createApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from './router'
import { i18n } from './i18n'
import { applyTheme } from './composables/useTheme'
import './styles/tailwind.css'

applyTheme()
createApp(App).use(createAppRouter()).use(i18n).mount('#app')

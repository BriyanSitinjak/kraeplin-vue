import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// createApp + mount ≈ ReactDOM.createRoot(el).render(<App />)
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

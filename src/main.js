import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/tailwind.css'
import { initializeFirebase } from './firebase'

// Initialize Firebase before starting the app
initializeFirebase()

const app = createApp(App)

// Setup Pinia for state management
app.use(createPinia())
app.use(router)

app.mount('#app')

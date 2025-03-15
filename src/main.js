import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/tailwind.css'

// VueFire
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './firebase'

// Initialize app with all plugins
const app = createApp(App)

// Setup VueFire
app.use(VueFire, {
  firebaseApp,
  modules: [
    VueFireAuth(),
  ],
})

app.use(createPinia())
app.use(router)
app.mount('#app')

console.log('Firebase initialized successfully!')

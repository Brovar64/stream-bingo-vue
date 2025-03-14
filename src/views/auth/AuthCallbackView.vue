<template>
  <div class="container flex flex-col items-center justify-center min-h-[80vh]">
    <div class="w-full max-w-md text-center">
      <div v-if="loading">
        <div class="spinner mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold mb-2">Processing Login</h2>
        <p class="text-gray-400">Please wait while we complete your authentication...</p>
      </div>
      <div v-else-if="error">
        <div class="text-error text-5xl mb-4">✗</div>
        <h2 class="text-xl font-semibold mb-2">Authentication Failed</h2>
        <p class="text-gray-400 mb-6">{{ error }}</p>
        <router-link to="/login" class="btn btn-primary">Try Again</router-link>
      </div>
      <div v-else>
        <div class="text-success text-5xl mb-4">✓</div>
        <h2 class="text-xl font-semibold mb-2">Authentication Successful</h2>
        <p class="text-gray-400 mb-6">You are now signed in with Twitch.</p>
        <router-link to="/dashboard" class="btn btn-primary">Go to Dashboard</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'AuthCallbackView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    
    const loading = ref(true)
    const error = ref(null)
    
    onMounted(async () => {
      try {
        // Get hash parameters (from Twitch OAuth redirect)
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        
        if (accessToken) {
          // Process the Twitch authentication
          const success = await authStore.processTwitchAuth(accessToken)
          
          if (success) {
            // Clear the hash from URL
            history.replaceState(null, '', window.location.pathname)
            
            setTimeout(() => {
              loading.value = false
              
              // Redirect to dashboard after a brief delay
              setTimeout(() => {
                router.push('/dashboard')
              }, 1500)
            }, 1000)
          } else {
            throw new Error('Failed to process authentication')
          }
        } else {
          throw new Error('No access token found in redirect')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        error.value = err.message || 'Authentication failed'
        loading.value = false
        notificationStore.showNotification('Authentication failed: ' + err.message, 'error')
      }
    })
    
    return {
      loading,
      error
    }
  }
}
</script>

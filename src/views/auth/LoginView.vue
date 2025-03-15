<template>
  <div class="container flex justify-center items-center min-h-[80vh]">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="title">Stream Bingo</h1>
        <p class="subtitle">Login to create or join bingo games for your stream</p>
      </div>
      
      <div class="card">
        <div class="space-y-6">
          <button
            @click="loginWithTwitch"
            class="w-full flex items-center justify-center py-3 px-4 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
          >
            <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.64 5.93H13.07V10.21H11.64M15.57 5.93H17V10.21H15.57M7 2L3.43 5.57V18.43H7.71V22L11.29 18.43H14.14L20.57 12V2M19.14 11.29L16.29 14.14H13.43L10.93 16.64V14.14H7.71V3.43H19.14Z" />
            </svg>
            Login with Twitch
          </button>

          <div class="relative flex py-3 items-center">
            <div class="flex-grow border-t border-gray-700"></div>
            <span class="flex-shrink mx-3 text-gray-500">or</span>
            <div class="flex-grow border-t border-gray-700"></div>
          </div>

          <!-- Admin Test User Button -->
          <button
            @click="loginAsTestUser('Admin')"
            class="w-full py-3 px-4 bg-background-lighter hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Login as Admin (Test)
          </button>
          
          <!-- Test Players Section -->
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-3">Test as Player</h3>
            <p class="text-sm text-gray-400 mb-4">
              Enter a name below to login as a test player or use a preset:
            </p>
            
            <!-- Custom Username Input -->
            <div class="flex mb-3">
              <input 
                v-model="customUsername" 
                placeholder="Enter player name" 
                class="flex-grow form-control"
                @keyup.enter="loginAsTestUser(customUsername)"
              />
              <button 
                @click="loginAsTestUser(customUsername)"
                :disabled="!customUsername.trim()"
                :class="['ml-2 btn', customUsername.trim() ? 'btn-primary' : 'bg-gray-600 cursor-not-allowed']"
              >
                Login
              </button>
            </div>
            
            <!-- Preset Test Players -->
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="player in presetPlayers"
                :key="player"
                @click="loginAsTestUser(player)"
                class="py-2 px-3 bg-background-lighter hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Login as {{ player }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-8">
          <p class="text-sm text-gray-400">
            By logging in, you agree to the terms of use and privacy policy.
          </p>
        </div>
      </div>
      
      <div class="text-center mt-6">
        <router-link to="/" class="text-primary hover:text-primary-light">
          ← Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    
    // Reactive state
    const customUsername = ref('')
    const presetPlayers = ['Player1', 'Player2', 'Viewer', 'StreamFan']
    
    // Check for redirect param
    const redirect = route.query.redirect || '/dashboard'
    
    // Methods
    function loginWithTwitch() {
      authStore.loginWithTwitch()
    }
    
    function loginAsTestUser(username) {
      // Validate the username
      if (!username || !username.trim()) {
        notificationStore.showNotification('Please enter a valid username', 'error')
        return
      }
      
      // Use the provided username or default to 'TestUser'
      const cleanUsername = username.trim()
      
      authStore.loginWithTestAccount(cleanUsername)
      notificationStore.showNotification(`Logged in as ${cleanUsername}`, 'success')
      
      // Navigate to redirect destination or dashboard
      router.push(redirect)
    }
    
    return {
      customUsername,
      presetPlayers,
      loginWithTwitch,
      loginAsTestUser
    }
  }
}
</script>

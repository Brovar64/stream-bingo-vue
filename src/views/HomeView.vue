<template>
  <div class="container">
    <div class="text-center py-12">
      <h1 class="text-4xl font-bold text-primary">Stream Bingo</h1>
      <p class="text-xl mt-4 text-gray-300">Interactive bingo game for streamers and viewers</p>
      
      <div class="mt-12 flex flex-col items-center">
        <div class="w-full max-w-md p-8 bg-background-card rounded-lg shadow-lg">
          <div v-if="isLoggedIn">
            <h2 class="text-2xl font-bold mb-4">Welcome Back!</h2>
            <p class="mb-6">You're signed in as <span class="font-bold">{{ username }}</span></p>
            <div class="flex flex-col gap-4">
              <button 
                @click="goToDashboard" 
                class="btn btn-primary"
              >
                Go to Dashboard
              </button>
              <button 
                @click="logout" 
                class="btn bg-background-lighter hover:bg-gray-700 text-white"
              >
                Logout
              </button>
            </div>
          </div>
          <div v-else>
            <h2 class="text-2xl font-bold mb-4">Get Started</h2>
            <p class="mb-6">Create or join bingo games for your stream</p>
            <div class="flex flex-col gap-4">
              <button 
                @click="login" 
                class="btn btn-primary"
              >
                Login with Twitch
              </button>
              <button 
                @click="loginAsTest" 
                class="btn bg-background-lighter hover:bg-gray-700 text-white"
              >
                Login as Test User
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-12 max-w-2xl">
          <h2 class="text-2xl font-bold mb-4">How It Works</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-background-card p-4 rounded-lg shadow">
              <div class="text-primary text-5xl font-bold mb-2">1</div>
              <h3 class="text-lg font-semibold">Create a Room</h3>
              <p class="text-gray-400">Streamers create a bingo room and add event words</p>
            </div>
            <div class="bg-background-card p-4 rounded-lg shadow">
              <div class="text-primary text-5xl font-bold mb-2">2</div>
              <h3 class="text-lg font-semibold">Join the Game</h3>
              <p class="text-gray-400">Viewers join with the room code and get unique bingo boards</p>
            </div>
            <div class="bg-background-card p-4 rounded-lg shadow">
              <div class="text-primary text-5xl font-bold mb-2">3</div>
              <h3 class="text-lg font-semibold">Play Along</h3>
              <p class="text-gray-400">Mark cells when events happen and get admin approval to win</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    
    // Computed properties
    const isLoggedIn = computed(() => authStore.isLoggedIn)
    const username = computed(() => authStore.username)
    
    // Methods
    function login() {
      authStore.loginWithTwitch()
    }
    
    function loginAsTest() {
      authStore.loginWithTestAccount('TestUser')
      notificationStore.showNotification('Logged in as test user', 'success')
      goToDashboard()
    }
    
    function logout() {
      authStore.logout()
      notificationStore.showNotification('Logged out successfully', 'success')
    }
    
    function goToDashboard() {
      router.push('/dashboard')
    }
    
    return {
      isLoggedIn,
      username,
      login,
      loginAsTest,
      logout,
      goToDashboard
    }
  }
}
</script>

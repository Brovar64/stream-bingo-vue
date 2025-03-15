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
            <p class="mb-3">Create or join bingo games for your stream</p>
            
            <!-- Test user selector and mode -->
            <div class="mb-6 p-3 bg-background-lighter rounded-lg" v-if="showTestOptions">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-primary">Test User Options</h3>
                <button 
                  @click="showTestOptions = false" 
                  class="text-xs text-gray-400 hover:text-white"
                >
                  Hide
                </button>
              </div>
              
              <!-- Create a new test user -->
              <div class="mb-4">
                <label class="block text-xs text-gray-400 mb-1">Create New Test User</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    v-model="newTestUsername" 
                    placeholder="Username" 
                    class="form-control text-sm py-2"
                  />
                  <button 
                    @click="loginAsNamedTest" 
                    class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1"
                    :disabled="!newTestUsername.trim()"
                  >
                    Create
                  </button>
                </div>
              </div>
              
              <!-- Existing test users -->
              <div v-if="existingUsers.length > 0">
                <label class="block text-xs text-gray-400 mb-1">Existing Test Users</label>
                <div class="max-h-40 overflow-y-auto border border-gray-700 rounded bg-background-card">
                  <div 
                    v-for="user in existingUsers" 
                    :key="user.uid" 
                    class="flex justify-between items-center p-2 hover:bg-gray-800 border-b border-gray-700 last:border-b-0"
                  >
                    <div class="text-sm">{{ user.displayName }}</div>
                    <button 
                      @click="loginWithUser(user)" 
                      class="text-xs bg-primary hover:bg-primary-dark text-white px-2 py-1 rounded"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Clear test users -->
              <div class="mt-3 flex justify-end">
                <button 
                  @click="clearAllTestUsers" 
                  class="text-xs text-gray-400 hover:text-error"
                >
                  Clear All Test Users
                </button>
              </div>
            </div>
            
            <div class="flex flex-col gap-4">
              <button 
                @click="login" 
                class="btn btn-primary"
              >
                Login with Twitch
              </button>
              
              <div class="flex items-center gap-2">
                <button 
                  @click="loginAsTest" 
                  class="btn bg-background-lighter hover:bg-gray-700 text-white flex-1"
                >
                  Login as Test User
                </button>
                <button 
                  @click="showTestOptions = !showTestOptions" 
                  class="btn bg-background-lighter hover:bg-gray-700 text-white p-2"
                  title="Show test options"
                >
                  <span v-if="showTestOptions">−</span>
                  <span v-else>+</span>
                </button>
              </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    
    // State
    const showTestOptions = ref(false)
    const newTestUsername = ref('')
    
    // Computed properties
    const isLoggedIn = computed(() => authStore.isLoggedIn)
    const username = computed(() => authStore.username)
    const existingUsers = computed(() => authStore.testUsers || [])
    
    // Methods
    function login() {
      authStore.loginWithTwitch()
    }
    
    function loginAsTest() {
      authStore.loginWithTestAccount('TestUser')
      notificationStore.showNotification('Logged in as test user', 'success')
      goToDashboard()
    }
    
    function loginAsNamedTest() {
      if (!newTestUsername.value.trim()) return
      
      authStore.loginWithTestAccount(newTestUsername.value.trim())
      notificationStore.showNotification(`Logged in as ${newTestUsername.value}`, 'success')
      newTestUsername.value = ''
      goToDashboard()
    }
    
    function loginWithUser(user) {
      authStore.loginWithExistingUser(user)
      goToDashboard()
    }
    
    function clearAllTestUsers() {
      if (confirm('Are you sure you want to clear all test users? This cannot be undone.')) {
        authStore.clearTestUsers()
      }
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
      showTestOptions,
      newTestUsername,
      existingUsers,
      login,
      loginAsTest,
      loginAsNamedTest,
      loginWithUser,
      clearAllTestUsers,
      logout,
      goToDashboard
    }
  }
}
</script>

<style scoped>
.form-control {
  @apply bg-background-lighter border border-gray-700 rounded px-3 py-2 w-full text-white;
}
</style>
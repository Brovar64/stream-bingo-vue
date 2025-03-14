import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/firebase'
import { useNotificationStore } from '@/stores/notification'
import { 
  signInAnonymously, 
  signOut,
  onAuthStateChanged,
  getRedirectResult
} from 'firebase/auth'

// Fake Twitch authentication utilities
const STORAGE_KEY = 'streamBingoUser'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const notificationStore = useNotificationStore()
  
  // Getters
  const isLoggedIn = computed(() => !!user.value)
  const username = computed(() => user.value?.displayName || 'Guest')
  
  // Actions
  
  /**
   * Initialize the authentication state
   */
  async function initialize() {
    if (initialized.value) return true
    
    loading.value = true
    
    try {
      // Try to load user from local storage (for test user support)
      const storedUser = localStorage.getItem(STORAGE_KEY)
      if (storedUser) {
        user.value = JSON.parse(storedUser)
        initialized.value = true
        loading.value = false
        return true
      }
      
      // Set up auth state listener
      onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
          user.value = {
            uid: authUser.uid,
            displayName: authUser.displayName || 'User',
            email: authUser.email,
            authMethod: 'firebase'
          }
        } else {
          user.value = null
        }
        initialized.value = true
      })
      
      // Check for redirect result (for potential OAuth providers later)
      const result = await getRedirectResult(auth)
      if (result) {
        user.value = {
          uid: result.user.uid,
          displayName: result.user.displayName || 'User',
          email: result.user.email,
          authMethod: 'firebase'
        }
      }
      
      return true
    } catch (error) {
      console.error('Auth initialization error:', error)
      notificationStore.showNotification('Authentication initialization failed', 'error')
      initialized.value = true
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Sign in with Twitch (simulated for test purposes)
   * In a real app, this would redirect to Twitch OAuth
   */
  function loginWithTwitch() {
    window.location.href = 'https://id.twitch.tv/oauth2/authorize' +
      '?client_id=k53e9s8oc2leprhcgyoa010e38bm6s' +
      '&redirect_uri=' + encodeURIComponent(window.location.origin + '/auth-callback') +
      '&response_type=token' +
      '&scope=user:read:email';
  }
  
  /**
   * Login with a test account (for development)
   */
  function loginWithTestAccount(username = 'TestUser') {
    loading.value = true
    
    try {
      // Create a fake user object
      const testUser = {
        uid: 'test-user-' + Date.now(),
        displayName: username,
        email: `${username.toLowerCase()}@example.com`,
        authMethod: 'test'
      }
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testUser))
      
      // Update state
      user.value = testUser
      
      notificationStore.showNotification('Logged in as test user ' + username, 'success')
      return true
    } catch (error) {
      console.error('Test login error:', error)
      notificationStore.showNotification('Test login failed', 'error')
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Process Twitch token from callback
   */
  function processTwitchAuth(accessToken) {
    loading.value = true
    
    try {
      // In production, you'd validate this token with Twitch API
      if (accessToken) {
        const twitchUser = {
          uid: 'twitch-user-' + Date.now(),
          displayName: 'TwitchUser',
          authMethod: 'twitch',
          token: accessToken
        }
        
        // Store in localStorage for persistence
        localStorage.setItem(STORAGE_KEY, JSON.stringify(twitchUser))
        
        // Update state
        user.value = twitchUser
        
        notificationStore.showNotification('Logged in with Twitch', 'success')
        return true
      }
      return false
    } catch (error) {
      console.error('Twitch auth error:', error)
      notificationStore.showNotification('Twitch login failed', 'error')
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Sign out the current user
   */
  async function logout() {
    loading.value = true
    
    try {
      // Remove from localStorage
      localStorage.removeItem(STORAGE_KEY)
      
      // Sign out from Firebase (if using it)
      if (user.value?.authMethod === 'firebase') {
        await signOut(auth)
      }
      
      // Update state
      user.value = null
      
      notificationStore.showNotification('Logged out successfully', 'success')
      return true
    } catch (error) {
      console.error('Logout error:', error)
      notificationStore.showNotification('Logout failed', 'error')
      return false
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    user,
    initialized,
    loading,
    
    // Getters
    isLoggedIn,
    username,
    
    // Actions
    initialize,
    loginWithTwitch,
    loginWithTestAccount,
    processTwitchAuth,
    logout
  }
})

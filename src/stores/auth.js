import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/firebase'
import { useNotificationStore } from '@/stores/notification'
import { 
  signOut,
  onAuthStateChanged,
  getRedirectResult
} from 'firebase/auth'

// Fake Twitch authentication utilities
const STORAGE_KEY = 'streamBingoUser'
const USERS_STORAGE_KEY = 'streamBingoUsers'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const notificationStore = useNotificationStore()
  
  // Getters
  const isLoggedIn = computed(() => !!user.value)
  const username = computed(() => user.value?.displayName || 'Guest')
  
  // Get all test users from storage
  const testUsers = computed(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
      if (storedUsers) {
        return JSON.parse(storedUsers)
      }
    } catch (error) {
      console.error('Error parsing test users:', error)
    }
    return []
  })
  
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
        
        // Add this user to the test users list if it's a test user
        if (user.value.authMethod === 'test') {
          saveUserToTestUsers(user.value)
        }
        
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
   * Save a user to the test users list
   */
  function saveUserToTestUsers(userObj) {
    if (!userObj || userObj.authMethod !== 'test') return

    try {
      const users = testUsers.value || []
      
      // Check if user already exists in the list
      const existingIndex = users.findIndex(u => u.uid === userObj.uid)
      
      if (existingIndex === -1) {
        // Only add if it doesn't exist
        users.push(userObj)
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      }
    } catch (error) {
      console.error('Error saving test user:', error)
    }
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
        authMethod: 'test',
        createdAt: new Date().toISOString()
      }
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testUser))
      
      // Update state
      user.value = testUser
      
      // Add to test users list
      saveUserToTestUsers(testUser)
      
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
   * Login with an existing test user
   */
  function loginWithExistingUser(userObj) {
    loading.value = true
    
    try {
      if (!userObj || !userObj.uid) {
        throw new Error('Invalid user object')
      }
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj))
      
      // Update state
      user.value = userObj
      
      notificationStore.showNotification('Logged in as ' + userObj.displayName, 'success')
      return true
    } catch (error) {
      console.error('Existing user login error:', error)
      notificationStore.showNotification('Login failed', 'error')
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
          token: accessToken,
          createdAt: new Date().toISOString()
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
  
  /**
   * Clear all test users (for development)
   */
  function clearTestUsers() {
    try {
      localStorage.removeItem(USERS_STORAGE_KEY)
      notificationStore.showNotification('All test users cleared', 'success')
      return true
    } catch (error) {
      console.error('Error clearing test users:', error)
      notificationStore.showNotification('Failed to clear test users', 'error')
      return false
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
    testUsers,
    
    // Actions
    initialize,
    loginWithTwitch,
    loginWithTestAccount,
    loginWithExistingUser,
    processTwitchAuth,
    logout,
    clearTestUsers,
    saveUserToTestUsers
  }
})
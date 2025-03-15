import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useNotificationStore } from '@/stores/notification'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6HO0LPJwI4tlWYlYSxw2IEGUu6Fu-fOU",
  authDomain: "stream-bingo-ecb40.firebaseapp.com",
  projectId: "stream-bingo-ecb40",
  storageBucket: "stream-bingo-ecb40.appspot.com",
  messagingSenderId: "814141306111",
  appId: "1:814141306111:web:319ac02de11210186408ca",
  measurementId: "G-1DYM2MTE10"
}

// Initialize Firebase
console.log('Initializing Firebase...')
export const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firestore with settings to reduce errors
export const db = getFirestore(firebaseApp)

// Enable offline data persistence with error handling
const enablePersistence = async () => {
  try {
    // Handling the "channel closed" errors by using a larger cache size
    await enableIndexedDbPersistence(db, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
    console.log('Firestore persistence enabled successfully')
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence.')
    } else {
      console.error('Error enabling persistence:', err)
    }
  }
}

// Delay the persistence initialization to prevent issues during app startup
setTimeout(() => {
  enablePersistence().catch(err => {
    console.error('Failed to initialize persistence:', err)
    
    // Create notification store for error reporting to user
    try {
      const notificationStore = useNotificationStore()
      notificationStore.showNotification(
        'Warning: Offline mode may not work properly. This won\'t affect your gameplay.',
        'warning'
      )
    } catch (e) {
      console.warn('Could not show notification:', e)
    }
  })
}, 2000)

export const auth = getAuth(firebaseApp)

// For compatibility with existing code, also export initialization function
export function initializeFirebase() {
  console.log('Firebase already initialized via VueFire')
  return true
}

// Add window error handling to catch Firebase WebChannel errors
window.addEventListener('error', (event) => {
  const errorMsg = event.message || ''
  
  // If this is a Firebase WebChannel or network error, we can suppress it
  if (
    errorMsg.includes('Message channel closed') || 
    errorMsg.includes('ERR_BLOCKED_BY_CLIENT') ||
    errorMsg.includes('network error')
  ) {
    console.warn('Suppressed Firebase error:', errorMsg)
    event.preventDefault() // Prevent error from being logged to console
  }
}, true)

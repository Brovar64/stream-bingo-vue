import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

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

// Initialize Firestore with better settings to reduce errors
export const db = getFirestore(firebaseApp)

// Enable offline data persistence with better error handling
try {
  enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence.')
      } else {
        console.error('Error enabling persistence:', err)
      }
    })
} catch (error) {
  console.error('Error enabling persistence:', error)
}

export const auth = getAuth(firebaseApp)

// For compatibility with existing code, also export initialization function
export function initializeFirebase() {
  console.log('Firebase already initialized via VueFire')
  return true
}

// Add global error handler to suppress non-critical Firebase errors
window.addEventListener('error', (event) => {
  // Check if this is a Firebase error that we can safely ignore
  if (event.message && (
    event.message.includes('Message channel closed') ||
    event.message.includes('ERR_BLOCKED_BY_CLIENT') ||
    event.message.includes('FirebaseError') ||
    event.message.includes('network error')
  )) {
    console.warn('Suppressed Firebase error:', event.message)
    event.preventDefault() // Prevent it from showing in console
    event.stopPropagation()
    return true
  }
}, true) // Use capture phase

// Also handle unhandled promise rejections that might come from Firebase
window.addEventListener('unhandledrejection', (event) => {
  // Check if this is a Firebase rejection that we can safely ignore
  if (event.reason && event.reason.message && (
    event.reason.message.includes('Message channel closed') ||
    event.reason.message.includes('ERR_BLOCKED_BY_CLIENT') ||
    event.reason.message.includes('FirebaseError') ||
    event.reason.message.includes('network error')
  )) {
    console.warn('Suppressed Firebase promise rejection:', event.reason.message)
    event.preventDefault() // Prevent it from showing in console
    event.stopPropagation()
    return true
  }
}, true) // Use capture phase

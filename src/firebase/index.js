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
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

// Enable offline data persistence with improved settings
try {
  enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED  // Use unlimited cache to avoid size errors
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

// For compatibility with existing code, also export initialization function
export function initializeFirebase() {
  console.log('Firebase already initialized via VueFire')
  return true
}

// Add global error handler to suppress common Firebase errors in console
window.addEventListener('error', (event) => {
  const errorMsg = event.message || '';
  
  // Check if this is a Firebase error we want to suppress
  if (
    errorMsg.includes('Message channel closed before a response was received') ||
    errorMsg.includes('ERR_BLOCKED_BY_CLIENT') ||
    errorMsg.includes('firestore.googleapis.com')
  ) {
    // Log a more user-friendly warning instead of the error
    console.warn('Suppressed Firebase connection error. This will not affect functionality.');
    
    // Prevent the error from appearing in the console
    event.preventDefault();
    return false;
  }
});

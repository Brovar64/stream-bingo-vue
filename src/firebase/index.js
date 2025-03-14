import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
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
let app
let db
let auth

export function initializeFirebase() {
  console.log('Initializing Firebase...')
  
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    
    // Enable offline data persistence (will show a deprecation warning, but still works)
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support all of the features required to enable persistence.')
        }
      })
    
    console.log('Firebase initialized successfully!')
    return true
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return false
  }
}

// Export Firebase instances
export { app, db, auth }

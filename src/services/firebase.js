import { initializeApp } from 'firebase/app'
import { 
  getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED,
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, 
  onSnapshot, arrayUnion, arrayRemove
} from 'firebase/firestore'
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signOut,
  getRedirectResult
} from 'firebase/auth'

// Firebase configuration
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
console.log('Initializing Firebase Service...')
export const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firestore with improved settings
export const db = getFirestore(firebaseApp)

// Initialize Auth
export const auth = getAuth(firebaseApp)

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

// Cache for active listeners
const activeListeners = new Map();

/**
 * FirebaseService - A centralized service for all Firebase operations
 */
export const FirebaseService = {
  /**
   * Document Operations
   */
  Documents: {
    // Get a document once
    async get(collectionName, docId) {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          return null;
        }
      } catch (error) {
        console.error(`Error getting document ${docId} from ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Create or update a document
    async set(collectionName, docId, data, options = { merge: true }) {
      try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data, options);
        return docId;
      } catch (error) {
        console.error(`Error setting document ${docId} in ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Update specific fields in a document
    async update(collectionName, docId, data) {
      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        return docId;
      } catch (error) {
        console.error(`Error updating document ${docId} in ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Delete a document
    async delete(collectionName, docId) {
      try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Listen to a document with real-time updates
    onSnapshot(collectionName, docId, callback) {
      try {
        const docRef = doc(db, collectionName, docId);
        
        // Create a listener key
        const listenerKey = `${collectionName}/${docId}`;
        
        // Unsubscribe from any existing listener for this document
        if (activeListeners.has(listenerKey)) {
          activeListeners.get(listenerKey)();
          activeListeners.delete(listenerKey);
        }
        
        // Set up the new listener
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
          } else {
            callback(null);
          }
        }, (error) => {
          console.error(`Error in document listener for ${docId} in ${collectionName}:`, error);
          throw error;
        });
        
        // Store the unsubscribe function
        activeListeners.set(listenerKey, unsubscribe);
        
        // Return the unsubscribe function
        return unsubscribe;
      } catch (error) {
        console.error(`Error setting up document listener for ${docId} in ${collectionName}:`, error);
        throw error;
      }
    }
  },
  
  /**
   * Collection Operations
   */
  Collections: {
    // Get all documents from a collection
    async getAll(collectionName) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const docs = [];
        
        querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        
        return docs;
      } catch (error) {
        console.error(`Error getting all documents from ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Query documents in a collection
    async query(collectionName, conditions = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
      try {
        let q = collection(db, collectionName);
        
        // Add where conditions
        if (conditions && conditions.length > 0) {
          for (const condition of conditions) {
            q = query(q, where(condition.field, condition.operator, condition.value));
          }
        }
        
        // Add orderBy
        if (orderByField) {
          q = query(q, orderBy(orderByField, orderDirection));
        }
        
        // Add limit
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        
        // Execute query
        const querySnapshot = await getDocs(q);
        const docs = [];
        
        querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        
        return docs;
      } catch (error) {
        console.error(`Error querying collection ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Listen to a query with real-time updates
    onSnapshot(collectionName, conditions = [], callback, orderByField = null, orderDirection = 'asc', limitCount = null) {
      try {
        let q = collection(db, collectionName);
        
        // Add where conditions
        if (conditions && conditions.length > 0) {
          for (const condition of conditions) {
            q = query(q, where(condition.field, condition.operator, condition.value));
          }
        }
        
        // Add orderBy
        if (orderByField) {
          q = query(q, orderBy(orderByField, orderDirection));
        }
        
        // Add limit
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        
        // Create a listener key
        const listenerKey = `query:${collectionName}:${JSON.stringify(conditions)}`;
        
        // Unsubscribe from any existing listener with this key
        if (activeListeners.has(listenerKey)) {
          activeListeners.get(listenerKey)();
          activeListeners.delete(listenerKey);
        }
        
        // Set up the new listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const docs = [];
          querySnapshot.forEach((doc) => {
            docs.push({ id: doc.id, ...doc.data() });
          });
          callback(docs);
        }, (error) => {
          console.error(`Error in collection listener for ${collectionName}:`, error);
          throw error;
        });
        
        // Store the unsubscribe function
        activeListeners.set(listenerKey, unsubscribe);
        
        // Return the unsubscribe function
        return unsubscribe;
      } catch (error) {
        console.error(`Error setting up collection listener for ${collectionName}:`, error);
        throw error;
      }
    }
  },
  
  /**
   * Array Operations
   */
  Arrays: {
    // Add items to an array field
    async addToArray(collectionName, docId, fieldName, items) {
      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
          [fieldName]: arrayUnion(...items)
        });
        return true;
      } catch (error) {
        console.error(`Error adding items to array ${fieldName} in document ${docId}:`, error);
        throw error;
      }
    },
    
    // Remove items from an array field
    async removeFromArray(collectionName, docId, fieldName, items) {
      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
          [fieldName]: arrayRemove(...items)
        });
        return true;
      } catch (error) {
        console.error(`Error removing items from array ${fieldName} in document ${docId}:`, error);
        throw error;
      }
    }
  },
  
  /**
   * Utility Operations
   */
  Utils: {
    // Get server timestamp
    getServerTimestamp() {
      return serverTimestamp();
    },
    
    // Clean up all active listeners
    cleanupListeners() {
      activeListeners.forEach(unsubscribe => {
        unsubscribe();
      });
      activeListeners.clear();
    }
  },
  
  /**
   * Auth Operations
   */
  Auth: {
    // Sign in anonymously
    async signInAnonymously() {
      try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
      } catch (error) {
        console.error('Error signing in anonymously:', error);
        throw error;
      }
    },
    
    // Sign out
    async signOut() {
      try {
        await signOut(auth);
        return true;
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    
    // Get current user
    getCurrentUser() {
      return auth.currentUser;
    },
    
    // Listen to auth state changes
    onAuthStateChanged(callback) {
      return onAuthStateChanged(auth, callback);
    },
    
    // Get redirect result
    async getRedirectResult() {
      try {
        return await getRedirectResult(auth);
      } catch (error) {
        console.error('Error getting redirect result:', error);
        throw error;
      }
    }
  }
};

export default FirebaseService;
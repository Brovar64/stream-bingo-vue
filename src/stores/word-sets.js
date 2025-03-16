import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  limit,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'

export const useWordSetStore = defineStore('wordSet', () => {
  // Get dependencies
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  
  // State
  const wordSets = ref([])
  const playerPunishmentSets = ref([])
  const creatorPunishmentSets = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Constants
  const MAX_SETS_PER_TYPE = 10
  const MAX_ITEMS_PER_SET = 50
  
  // Load user's word sets
  async function loadWordSets() {
    if (!authStore.user?.uid) {
      notificationStore.showNotification('You must be logged in to access your word sets', 'error')
      return false
    }
    
    loading.value = true
    error.value = null
    
    try {
      // Clear current sets
      wordSets.value = []
      playerPunishmentSets.value = []
      creatorPunishmentSets.value = []
      
      // Query for word sets
      const setsRef = collection(db, 'wordSets')
      const q = query(
        setsRef, 
        where('ownerId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      
      // Process results
      snapshot.forEach((doc) => {
        const setData = doc.data()
        const set = {
          id: doc.id,
          name: setData.name,
          items: setData.items || [],
          type: setData.type,
          createdAt: setData.createdAt?.toDate() || new Date(),
          updatedAt: setData.updatedAt?.toDate() || null
        }
        
        // Add to the appropriate array based on type
        if (setData.type === 'word') {
          wordSets.value.push(set)
        } else if (setData.type === 'playerPunishment') {
          playerPunishmentSets.value.push(set)
        } else if (setData.type === 'creatorPunishment') {
          creatorPunishmentSets.value.push(set)
        }
      })
      
      loading.value = false
      return true
    } catch (err) {
      console.error('Error loading word sets:', err)
      error.value = err.message
      loading.value = false
      notificationStore.showNotification(`Error loading word sets: ${err.message}`, 'error')
      return false
    }
  }
  
  // Create or update a word set
  async function saveWordSet(setData, existingId = null) {
    if (!authStore.user?.uid) {
      notificationStore.showNotification('You must be logged in to save word sets', 'error')
      return null
    }
    
    loading.value = true
    error.value = null
    
    try {
      // Validate input
      if (!setData.name || !setData.items || !setData.type) {
        throw new Error('Missing required data for word set')
      }
      
      // Enforce item limit
      if (setData.items.length > MAX_ITEMS_PER_SET) {
        setData.items = setData.items.slice(0, MAX_ITEMS_PER_SET)
        notificationStore.showNotification(`Set limited to ${MAX_ITEMS_PER_SET} items`, 'warning')
      }
      
      // Check set count limit if creating new set
      if (!existingId) {
        let currentSets
        if (setData.type === 'word') {
          currentSets = wordSets.value
        } else if (setData.type === 'playerPunishment') {
          currentSets = playerPunishmentSets.value
        } else if (setData.type === 'creatorPunishment') {
          currentSets = creatorPunishmentSets.value
        } else {
          throw new Error('Invalid set type')
        }
        
        if (currentSets.length >= MAX_SETS_PER_TYPE) {
          throw new Error(`You can only have ${MAX_SETS_PER_TYPE} ${setData.type} sets. Please delete one first.`)
        }
      }
      
      // Prepare data
      const now = serverTimestamp()
      const setId = existingId || doc(collection(db, 'wordSets')).id
      
      const dataToSave = {
        name: setData.name,
        items: setData.items,
        type: setData.type,
        ownerId: authStore.user.uid,
        updatedAt: now
      }
      
      // Add createdAt only for new sets
      if (!existingId) {
        dataToSave.createdAt = now
      }
      
      // Save to Firestore
      await setDoc(doc(db, 'wordSets', setId), dataToSave, { merge: !!existingId })
      
      // Reload sets to update local state
      await loadWordSets()
      
      loading.value = false
      return setId
    } catch (err) {
      console.error('Error saving word set:', err)
      error.value = err.message
      loading.value = false
      notificationStore.showNotification(`Error: ${err.message}`, 'error')
      return null
    }
  }
  
  // Delete a word set
  async function deleteWordSet(setId) {
    if (!authStore.user?.uid) {
      notificationStore.showNotification('You must be logged in to delete word sets', 'error')
      return false
    }
    
    loading.value = true
    error.value = null
    
    try {
      await deleteDoc(doc(db, 'wordSets', setId))
      
      // Reload sets to update local state
      await loadWordSets()
      
      loading.value = false
      return true
    } catch (err) {
      console.error('Error deleting word set:', err)
      error.value = err.message
      loading.value = false
      notificationStore.showNotification(`Error: ${err.message}`, 'error')
      return false
    }
  }
  
  // Computed values for set counts
  const wordSetCount = computed(() => wordSets.value.length)
  const playerPunishmentSetCount = computed(() => playerPunishmentSets.value.length)
  const creatorPunishmentSetCount = computed(() => creatorPunishmentSets.value.length)
  
  // Check if user has reached limit for a set type
  const canCreateWordSet = computed(() => wordSetCount.value < MAX_SETS_PER_TYPE)
  const canCreatePlayerPunishmentSet = computed(() => playerPunishmentSetCount.value < MAX_SETS_PER_TYPE)
  const canCreateCreatorPunishmentSet = computed(() => creatorPunishmentSetCount.value < MAX_SETS_PER_TYPE)
  
  return {
    // State
    wordSets,
    playerPunishmentSets,
    creatorPunishmentSets,
    loading,
    error,
    
    // Constants
    MAX_SETS_PER_TYPE,
    MAX_ITEMS_PER_SET,
    
    // Computed
    wordSetCount,
    playerPunishmentSetCount,
    creatorPunishmentSetCount,
    canCreateWordSet,
    canCreatePlayerPunishmentSet,
    canCreateCreatorPunishmentSet,
    
    // Methods
    loadWordSets,
    saveWordSet,
    deleteWordSet
  }
})
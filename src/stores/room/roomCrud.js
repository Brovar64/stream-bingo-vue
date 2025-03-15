import { currentRoom, loading, userRooms, unsubscribeRoomListener } from './state'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore'
import { db } from '@/firebase'

// Get dependencies
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

/**
 * Create a new bingo room
 * @param {string} roomCode - Room code/ID
 * @param {number} gridSize - Grid size (3, 4, or 5)
 * @param {Array} initialWords - Optional initial words for the room
 */
export async function createRoom(roomCode, gridSize = 5, initialWords = []) {
  loading.value = true
  
  try {
    if (!roomCode) {
      notificationStore.showNotification('Please enter a room code', 'error')
      return null
    }
    
    // Make room code uppercase
    roomCode = roomCode.toUpperCase()
    
    // Validate grid size
    if (![3, 4, 5].includes(gridSize)) {
      gridSize = 5 // Default to 5x5 if invalid
    }
    
    // Check if room already exists
    const roomRef = doc(db, 'rooms', roomCode)
    const roomDoc = await getDoc(roomRef)
    
    if (roomDoc.exists()) {
      notificationStore.showNotification('Room code already exists. Please choose a different code.', 'error')
      return null
    }
    
    // Create new room
    const roomData = {
      createdAt: serverTimestamp(),
      gridSize: gridSize,
      creatorId: authStore.user.uid,
      active: true,
      status: 'setup', // Room starts in setup mode before admin adds words
      players: [],
      words: initialWords || [], // Use initial words if provided
      pendingApprovals: [], // For tracking player marks that need admin approval
      calledOutWords: [] // Track words that have been called out
    }
    
    await setDoc(roomRef, roomData)
    
    notificationStore.showNotification(`Created room ${roomCode} with grid size ${gridSize}x${gridSize}`, 'success')
    
    // Load the room data
    await loadRoom(roomCode)
    
    return roomCode
  } catch (error) {
    console.error('Error creating room:', error)
    notificationStore.showNotification(`Error creating room: ${error.message}`, 'error')
    return null
  } finally {
    loading.value = false
  }
}

/**
 * Load a room by ID
 * @param {string} roomId - Room ID to load
 */
export async function loadRoom(roomId) {
  loading.value = true
  
  try {
    // Unsubscribe from previous listener if exists
    if (unsubscribeRoomListener.value) {
      unsubscribeRoomListener.value()
      unsubscribeRoomListener.value = null
    }
    
    // Get room reference
    const roomRef = doc(db, 'rooms', roomId)
    
    // Set up real-time listener
    unsubscribeRoomListener.value = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        // Store the room ID within the data object for convenience
        currentRoom.value = { 
          id: doc.id, 
          ...data 
        }
      } else {
        currentRoom.value = null
        notificationStore.showNotification('Room not found', 'error')
      }
      loading.value = false
    }, (error) => {
      console.error('Room listener error:', error)
      notificationStore.showNotification(`Error loading room: ${error.message}`, 'error')
      loading.value = false
    })
    
    return true
  } catch (error) {
    console.error('Error loading room:', error)
    notificationStore.showNotification(`Error loading room: ${error.message}`, 'error')
    loading.value = false
    return false
  }
}

/**
 * Load all rooms created by the current user
 */
export async function loadUserRooms() {
  loading.value = true
  
  try {
    const userId = authStore.user.uid
    
    if (!userId) {
      notificationStore.showNotification('You must be logged in to view your rooms', 'error')
      return []
    }
    
    // Query rooms created by this user
    const roomsRef = collection(db, 'rooms')
    const q = query(roomsRef, where('creatorId', '==', userId))
    const snapshot = await getDocs(q)
    
    // Convert snapshot to array
    const rooms = []
    snapshot.forEach((doc) => {
      rooms.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    // Update state
    userRooms.value = rooms
    
    return rooms
  } catch (error) {
    console.error('Error loading user rooms:', error)
    notificationStore.showNotification(`Error loading your rooms: ${error.message}`, 'error')
    return []
  } finally {
    loading.value = false
  }
}

/**
 * Delete a room by ID
 * @param {string} roomId - ID of the room to delete
 */
export async function deleteRoom(roomId) {
  loading.value = true
  
  try {
    // Get room reference
    const roomRef = doc(db, 'rooms', roomId)
    const roomDoc = await getDoc(roomRef)
    
    if (!roomDoc.exists()) {
      notificationStore.showNotification('Room not found.', 'error')
      return false
    }
    
    // Check if user is the creator
    const roomData = roomDoc.data()
    if (roomData.creatorId !== authStore.user.uid) {
      notificationStore.showNotification('You do not have permission to delete this room.', 'error')
      return false
    }
    
    // Delete room
    await deleteDoc(roomRef)
    
    notificationStore.showNotification(`Room ${roomId} deleted successfully.`, 'success')
    
    // Refresh user rooms list
    await loadUserRooms()
    
    return true
  } catch (error) {
    console.error('Error deleting room:', error)
    notificationStore.showNotification(`Error deleting room: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

// Cleanup function to unsubscribe listeners
export function cleanup() {
  if (unsubscribeRoomListener.value) {
    unsubscribeRoomListener.value()
    unsubscribeRoomListener.value = null
  }
  currentRoom.value = null
}

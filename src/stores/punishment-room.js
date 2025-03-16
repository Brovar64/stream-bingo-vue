import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { 
  doc, 
  collection, 
  getDoc, 
  getDocs,
  query,
  where,
  setDoc, 
  updateDoc, 
  deleteDoc,
  arrayUnion, 
  arrayRemove, 
  serverTimestamp 
} from 'firebase/firestore'

export const usePunishmentRoomStore = defineStore('punishmentRoom', () => {
  // Get dependencies
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  
  // State
  const currentRoom = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Computed values
  const isRoomSetup = computed(() => currentRoom.value?.status === 'setup')
  const isRoomActive = computed(() => currentRoom.value?.status === 'active')
  const requiredCells = computed(() => {
    const gridWidth = 4 // Fixed width for punishment mode
    const gridHeight = currentRoom.value?.gridHeight || 3
    return gridWidth * gridHeight
  })
  
  // Load a punishment room
  async function loadRoom(roomId) {
    loading.value = true
    error.value = null
    
    try {
      const roomRef = doc(db, 'punishmentRooms', roomId)
      const roomSnap = await getDoc(roomRef)
      
      if (!roomSnap.exists()) {
        throw new Error(`Room ${roomId} not found`)
      }
      
      currentRoom.value = { id: roomSnap.id, ...roomSnap.data() }
      loading.value = false
      return currentRoom.value
    } catch (err) {
      console.error('Error loading punishment room:', err)
      error.value = err.message
      loading.value = false
      throw err
    }
  }
  
  /**
   * Load all rooms created by the current user
   */
  async function loadUserRooms() {
    loading.value = true
    error.value = null
    
    try {
      const userId = authStore.user?.uid
      
      if (!userId) {
        notificationStore.showNotification('You must be logged in to view your rooms', 'error')
        return []
      }
      
      // Query rooms created by this user
      const roomsRef = collection(db, 'punishmentRooms')
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
      
      loading.value = false
      return rooms
    } catch (err) {
      console.error('Error loading user punishment rooms:', err)
      error.value = err.message
      loading.value = false
      return []
    }
  }
  
  /**
   * Delete a punishment room
   * @param {string} roomId - ID of the room to delete
   */
  async function deleteRoom(roomId) {
    loading.value = true
    error.value = null
    
    try {
      // Get room reference
      const roomRef = doc(db, 'punishmentRooms', roomId)
      const roomDoc = await getDoc(roomRef)
      
      if (!roomDoc.exists()) {
        notificationStore.showNotification('Room not found.', 'error')
        return { success: false, error: 'Room not found' }
      }
      
      // Check if user is the creator
      const roomData = roomDoc.data()
      if (roomData.creatorId !== authStore.user.uid) {
        notificationStore.showNotification('You do not have permission to delete this room.', 'error')
        return { success: false, error: 'Permission denied' }
      }
      
      // Delete room
      await deleteDoc(roomRef)
      
      notificationStore.showNotification(`Room ${roomId} deleted successfully.`, 'success')
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting punishment room:', err)
      error.value = err.message
      loading.value = false
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // Create a new punishment room
  async function createRoom(gridHeight = 3) {
    loading.value = true
    error.value = null
    
    try {
      console.log('Creating new punishment room with grid height:', gridHeight);
      
      // Generate a random 6-character alphanumeric room code
      const generateRoomCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let result = ''
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
      }
      
      const roomId = generateRoomCode()
      console.log('Generated room code:', roomId);
      
      // Create the room document
      const roomData = {
        createdAt: serverTimestamp(),
        creatorId: authStore.user?.uid || 'unknown-user',
        status: 'setup',
        gridHeight: parseInt(gridHeight), // Ensure gridHeight is a number
        grid: {}, // Will contain the cells with phrases and punishments
        calledOutCells: [], // Cells that have been marked as completed
        players: [],
        completedPunishments: [], // Punishments marked as completed
        punishmentVotes: {} // Voting data for punishments
      }
      
      console.log('Preparing room data:', roomData);
      console.log('Auth user ID:', authStore.user?.uid);
      
      // Create the document in Firestore with explicit ID
      const roomRef = doc(db, 'punishmentRooms', roomId)
      await setDoc(roomRef, roomData)
      console.log('Room document created in Firestore');
      
      // Load the newly created room
      await loadRoom(roomId)
      console.log('Successfully loaded the new room');
      
      loading.value = false
      return { success: true, roomId }
    } catch (err) {
      console.error('Error creating punishment room:', err)
      error.value = err.message
      loading.value = false
      return { success: false, error: err.message }
    }
  }
  
  // Add a cell with phrase and punishment
  async function addCell(position, phrase, punishment, side) {
    if (!currentRoom.value || !isRoomSetup.value) return { success: false, error: 'Room not in setup mode' }
    
    try {
      const roomRef = doc(db, 'punishmentRooms', currentRoom.value.id)
      
      // Create a unique cell ID
      const cellId = `${position.row}_${position.col}`
      
      // Update the grid
      const updatedGrid = {
        ...currentRoom.value.grid,
        [cellId]: {
          position,
          phrase,
          punishment,
          side, // 'left' for creator, 'right' for players
          completed: false,
          votes: {
            yes: 0,
            no: 0,
            voters: []
          }
        }
      }
      
      await updateDoc(roomRef, {
        grid: updatedGrid
      })
      
      // Update local state
      currentRoom.value.grid = updatedGrid
      
      return { success: true }
    } catch (err) {
      console.error('Error adding cell:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  // Remove a cell
  async function removeCell(cellId) {
    if (!currentRoom.value || !isRoomSetup.value) return { success: false, error: 'Room not in setup mode' }
    
    try {
      const roomRef = doc(db, 'punishmentRooms', currentRoom.value.id)
      
      // Create a copy of the grid without the specified cell
      const { [cellId]: removed, ...updatedGrid } = currentRoom.value.grid
      
      await updateDoc(roomRef, {
        grid: updatedGrid
      })
      
      // Update local state
      currentRoom.value.grid = updatedGrid
      
      return { success: true }
    } catch (err) {
      console.error('Error removing cell:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  // Start the game (transition from setup to active)
  async function startGame() {
    if (!currentRoom.value || !isRoomSetup.value) return { success: false, error: 'Room not in setup mode' }
    
    // Check if we have enough cells defined
    const cellCount = Object.keys(currentRoom.value.grid || {}).length
    if (cellCount < requiredCells.value) {
      return { 
        success: false, 
        error: `Not enough cells defined. Need ${requiredCells.value}, have ${cellCount}.` 
      }
    }
    
    try {
      const roomRef = doc(db, 'punishmentRooms', currentRoom.value.id)
      
      await updateDoc(roomRef, {
        status: 'active'
      })
      
      // Update local state
      currentRoom.value.status = 'active'
      
      return { success: true }
    } catch (err) {
      console.error('Error starting game:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  // Mark a cell as completed (call out)
  async function markCellCompleted(cellId) {
    if (!currentRoom.value || !isRoomActive.value) return { success: false, error: 'Room not active' }
    
    try {
      const roomRef = doc(db, 'punishmentRooms', currentRoom.value.id)
      
      // Update the grid cell
      const updatedGrid = {
        ...currentRoom.value.grid
      }
      
      if (!updatedGrid[cellId]) {
        return { success: false, error: 'Cell not found' }
      }
      
      updatedGrid[cellId].completed = true
      
      await updateDoc(roomRef, {
        grid: updatedGrid,
        calledOutCells: arrayUnion(cellId)
      })
      
      // Update local state
      currentRoom.value.grid = updatedGrid
      if (!currentRoom.value.calledOutCells) {
        currentRoom.value.calledOutCells = []
      }
      currentRoom.value.calledOutCells.push(cellId)
      
      return { success: true }
    } catch (err) {
      console.error('Error marking cell completed:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  // Join a room as a player
  async function joinRoom(playerName, roomId) {
    try {
      const roomRef = doc(db, 'punishmentRooms', roomId)
      
      // First load the room to get current data
      await loadRoom(roomId)
      
      // Check if player already exists
      const existingPlayer = currentRoom.value?.players?.find(p => p.nickname === playerName)
      
      if (!existingPlayer) {
        // Create player data with current date instead of serverTimestamp
        const playerData = {
          nickname: playerName,
          joinedAt: new Date().toISOString() // Use ISO string instead of serverTimestamp
        }
        
        // Get current players array or empty array
        const currentPlayers = currentRoom.value?.players || []
        
        // Add new player
        const updatedPlayers = [...currentPlayers, playerData]
        
        // Update the document
        await updateDoc(roomRef, {
          players: updatedPlayers
        })
        
        // Update local state
        currentRoom.value.players = updatedPlayers
      }
      
      return { success: true }
    } catch (err) {
      console.error('Error joining room:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  // Vote on a punishment (whether it was completed or not)
  async function votePunishment(cellId, playerName, vote) {
    if (!currentRoom.value || !isRoomActive.value) return { success: false, error: 'Room not active' }
    
    try {
      const roomRef = doc(db, 'punishmentRooms', currentRoom.value.id)
      
      // Make sure the cell exists and is called out
      if (!currentRoom.value.grid[cellId] || !currentRoom.value.calledOutCells.includes(cellId)) {
        return { success: false, error: 'Cell not called out' }
      }
      
      // Get current votes
      const currentVotes = currentRoom.value.grid[cellId].votes || { yes: 0, no: 0, voters: [] }
      
      // Check if player already voted
      const alreadyVoted = currentVotes.voters.includes(playerName)
      
      // Clone the current grid to update it
      const updatedGrid = { ...currentRoom.value.grid }
      const updatedCell = { ...updatedGrid[cellId] }
      const updatedVotes = { ...currentVotes }
      
      // If already voted, remove previous vote
      if (alreadyVoted) {
        // No easy way to know their previous vote, so we'll recalculate
        // This isn't the most efficient but it's simple and works
        
        // Remove from voters
        updatedVotes.voters = updatedVotes.voters.filter(voter => voter !== playerName)
        
        // Recalculate votes based on vote records in punishmentVotes
        let yesCount = 0
        let noCount = 0
        
        const voteRecords = currentRoom.value.punishmentVotes || {}
        for (const voter of updatedVotes.voters) {
          if (voteRecords[`${cellId}_${voter}`] === 'yes') yesCount++
          if (voteRecords[`${cellId}_${voter}`] === 'no') noCount++
        }
        
        updatedVotes.yes = yesCount
        updatedVotes.no = noCount
      }
      
      // Add new vote
      updatedVotes.voters.push(playerName)
      if (vote === 'yes') updatedVotes.yes++
      else if (vote === 'no') updatedVotes.no++
      
      // Update the cell
      updatedCell.votes = updatedVotes
      updatedGrid[cellId] = updatedCell
      
      // Prepare vote record for the punishmentVotes object
      const voteKey = `${cellId}_${playerName}`
      const punishmentVotes = {
        ...(currentRoom.value.punishmentVotes || {}),
        [voteKey]: vote
      }
      
      // Save to Firestore
      await updateDoc(roomRef, {
        grid: updatedGrid,
        punishmentVotes
      })
      
      // Update local state
      currentRoom.value.grid = updatedGrid
      currentRoom.value.punishmentVotes = punishmentVotes
      
      return { success: true }
    } catch (err) {
      console.error('Error voting on punishment:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  // Mark a punishment as completed based on votes
  async function resolvePunishment(cellId, completed) {
    if (!currentRoom.value || !isRoomActive.value) return { success: false, error: 'Room not active' }
    
    try {
      const roomRef = doc(db, 'punishmentRooms', currentRoom.value.id)
      
      // Check if punishment was already resolved
      if (currentRoom.value.completedPunishments?.includes(cellId)) {
        return { success: false, error: 'Punishment already resolved' }
      }
      
      // Update completed punishments
      await updateDoc(roomRef, {
        completedPunishments: arrayUnion(cellId)
      })
      
      // Update local state
      if (!currentRoom.value.completedPunishments) {
        currentRoom.value.completedPunishments = []
      }
      currentRoom.value.completedPunishments.push(cellId)
      
      return { success: true }
    } catch (err) {
      console.error('Error resolving punishment:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  // Reset the game to setup mode
  async function resetGame() {
    if (!currentRoom.value) return { success: false, error: 'No room loaded' }
    
    try {
      const roomRef = doc(db, 'punishmentRooms', currentRoom.value.id)
      
      // Reset the room
      await updateDoc(roomRef, {
        status: 'setup',
        calledOutCells: [],
        completedPunishments: [],
        punishmentVotes: {}
      })
      
      // Update local state
      currentRoom.value.status = 'setup'
      currentRoom.value.calledOutCells = []
      currentRoom.value.completedPunishments = []
      currentRoom.value.punishmentVotes = {}
      
      return { success: true }
    } catch (err) {
      console.error('Error resetting game:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  // Cleanup resources
  function cleanup() {
    currentRoom.value = null
    loading.value = false
    error.value = null
  }
  
  return {
    // State
    currentRoom,
    loading,
    error,
    
    // Computed
    isRoomSetup,
    isRoomActive,
    requiredCells,
    
    // Methods
    loadRoom,
    loadUserRooms,
    deleteRoom,
    createRoom,
    addCell,
    removeCell,
    startGame,
    markCellCompleted,
    joinRoom,
    votePunishment,
    resolvePunishment,
    resetGame,
    cleanup
  }
})
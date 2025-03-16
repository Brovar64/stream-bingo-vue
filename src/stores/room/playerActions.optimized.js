import { currentRoom, loading } from './state'
import { useNotificationStore } from '@/stores/notification'
import { doc, getDoc, updateDoc, arrayUnion, Timestamp, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { loadRoom } from './roomCrud'
import { generateBingoGrid } from '@/utils/gridUtils'

// Get dependencies
const notificationStore = useNotificationStore()

/**
 * Join a room as a player with improved error handling and grid assignment
 * @param {string} nickname - Player nickname
 * @param {string} roomId - Room ID to join
 */
export async function joinRoom(nickname, roomId) {
  console.log(`[JOIN ROOM] Starting join process: ${nickname}, ${roomId}`)
  
  if (!nickname) {
    console.log('[JOIN ROOM] Error: No nickname provided')
    notificationStore.showNotification('Please enter your nickname', 'error')
    return { success: false, error: 'No nickname provided' }
  }
  
  if (!roomId) {
    console.log('[JOIN ROOM] Error: No room ID provided')
    notificationStore.showNotification('Please enter a room code', 'error')
    return { success: false, error: 'No room code provided' }
  }
  
  // Make room ID uppercase
  roomId = roomId.toUpperCase()
  console.log(`[JOIN ROOM] Normalized room ID: ${roomId}`)
  
  try {
    loading.value = true
    console.log('[JOIN ROOM] Set loading to true')
    
    // Get room reference
    console.log('[JOIN ROOM] Getting room document')
    const roomRef = doc(db, 'rooms', roomId)
    const roomDoc = await getDoc(roomRef)
    
    if (!roomDoc.exists()) {
      console.log(`[JOIN ROOM] Error: Room ${roomId} not found`)
      notificationStore.showNotification(`Room ${roomId} not found`, 'error')
      loading.value = false
      return { success: false, error: 'Room not found' }
    }
    
    // Get room data
    const roomData = roomDoc.data()
    console.log(`[JOIN ROOM] Room found, status: ${roomData.status}`)
    
    // Check if room is active
    if (!roomData.active) {
      console.log('[JOIN ROOM] Error: Room is not active')
      notificationStore.showNotification('This room is no longer active', 'error')
      loading.value = false
      return { success: false, error: 'Room not active' }
    }
    
    // Create playerGrids structure if it doesn't exist
    if (!roomData.playerGrids) {
      console.log('[JOIN ROOM] Initializing playerGrids structure')
      await updateDoc(roomRef, { playerGrids: {} })
    }
    
    // Check if player already exists in the room
    const playerExists = (roomData.players || []).some(player => player.nickname === nickname)
    
    if (!playerExists) {
      console.log(`[JOIN ROOM] Adding new player ${nickname} to room`)
      // Create player data - Use client-side timestamp to safely work with arrays
      const playerData = {
        nickname: nickname,
        joinedAt: Timestamp.now()
      }
      
      // Update room using arrayUnion to safely add to the array
      await updateDoc(roomRef, { 
        players: arrayUnion(playerData)
      })
      
      notificationStore.showNotification(`Joined room ${roomId} as ${nickname}`, 'success')
    } else {
      console.log(`[JOIN ROOM] Player ${nickname} already exists in room, resuming session`)
      notificationStore.showNotification(`Resumed session in room ${roomId} as ${nickname}`, 'success')
    }
    
    // Load the room to update state
    console.log('[JOIN ROOM] Loading room data into state')
    await loadRoom(roomId)
    
    // Check if player grid needs to be created (if room is active)
    if (roomData.status === 'active') {
      await ensurePlayerHasGrid(nickname, roomId, roomData)
    }
    
    // Return success object
    console.log('[JOIN ROOM] Join process completed successfully')
    loading.value = false
    return { success: true, roomId: roomId }
  } catch (error) {
    console.error('[JOIN ROOM] Error joining room:', error)
    notificationStore.showNotification(`Error joining room: ${error.message}`, 'error')
    loading.value = false
    return { success: false, error: error.message }
  }
}

/**
 * Ensure player has a grid in an active room
 * @param {string} nickname - Player's nickname
 * @param {string} roomId - Room ID
 * @param {Object} roomData - Room data
 */
async function ensurePlayerHasGrid(nickname, roomId, roomData) {
  console.log(`[JOIN ROOM] Checking if player ${nickname} has a grid`)
  
  try {
    const hasExistingGrid = roomData.playerGrids && 
                         roomData.playerGrids[nickname] && 
                         Object.keys(roomData.playerGrids[nickname]).length > 0
    
    if (hasExistingGrid) {
      console.log(`[JOIN ROOM] Player ${nickname} already has a grid`)
      return true
    }
    
    // Player needs a grid
    console.log(`[JOIN ROOM] Player ${nickname} needs a grid, generating one`)
    
    // Generate a grid for this player
    const gridSize = roomData.gridSize || 5
    const words = roomData.words || []
    
    if (words.length < gridSize * gridSize) {
      console.log(`[JOIN ROOM] Not enough words to generate a grid. Have ${words.length}, need ${gridSize * gridSize}`)
      return false
    }
    
    // Generate a grid
    const playerGrid = generateBingoGrid(words, gridSize)
    
    if (!playerGrid) {
      console.log(`[JOIN ROOM] Failed to generate grid for player ${nickname}`)
      return false
    }
    
    // Update the room document
    const roomRef = doc(db, 'rooms', roomId)
    
    // Create a new playerGrids object with the player's grid
    let updatedPlayerGrids = roomData.playerGrids || {}
    updatedPlayerGrids[nickname] = playerGrid
    
    await updateDoc(roomRef, {
      [`playerGrids.${nickname}`]: playerGrid
    })
    
    console.log(`[JOIN ROOM] Successfully created grid for player ${nickname}`)
    return true
  } catch (error) {
    console.error(`[JOIN ROOM] Error ensuring player grid: ${error.message}`)
    return false
  }
}

/**
 * Mark a cell in a player's grid
 * @param {string} playerName - Player's nickname
 * @param {number} row - Cell row
 * @param {number} col - Cell column
 */
export async function markCell(playerName, row, col) {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    
    // Check if the game is in active status
    if (currentRoom.value.status !== 'active') {
      notificationStore.showNotification('Cannot mark cells - game is not active', 'error')
      loading.value = false
      return false
    }
    
    // Check if player exists in the room
    const playerExists = (currentRoom.value.players || []).some(player => player.nickname === playerName)
    if (!playerExists) {
      notificationStore.showNotification('You are not registered in this room', 'error')
      loading.value = false
      return false
    }
    
    // Check if player's grid exists
    if (!currentRoom.value.playerGrids || !currentRoom.value.playerGrids[playerName]) {
      notificationStore.showNotification('Your bingo grid is not ready yet', 'error')
      loading.value = false
      return false
    }
    
    // Get the cell in question
    const cellKey = `${row}_${col}`
    const grid = currentRoom.value.playerGrids[playerName]
    
    if (!grid[cellKey]) {
      notificationStore.showNotification('Invalid cell selection', 'error')
      loading.value = false
      return false
    }
    
    // If cell is already marked, don't allow changing
    if (grid[cellKey].marked) {
      notificationStore.showNotification('This cell is already marked', 'info')
      loading.value = false
      return false
    }
    
    // Create a deep copy of player grids
    const playerGrids = JSON.parse(JSON.stringify(currentRoom.value.playerGrids))
    
    // Update the cell as marked but pending approval
    playerGrids[playerName][cellKey].marked = true
    
    // Create approval request
    const approvalData = {
      playerName: playerName,
      row: row,
      col: col,
      word: grid[cellKey].word,
      timestamp: Timestamp.now() // Use client-side timestamp
    }
    
    // Update room data
    await updateDoc(roomRef, {
      playerGrids: playerGrids,
      pendingApprovals: arrayUnion(approvalData) // Use arrayUnion for safe array updates
    })
    
    notificationStore.showNotification('Cell marked! Waiting for admin approval.', 'success')
    loading.value = false
    return true
  } catch (error) {
    console.error('Error marking cell:', error)
    notificationStore.showNotification(`Error marking cell: ${error.message}`, 'error')
    loading.value = false
    return false
  }
}
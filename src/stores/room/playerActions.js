import { currentRoom, loading } from './state'
import { useNotificationStore } from '@/stores/notification'
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { loadRoom } from './roomCrud'

// Get dependencies
const notificationStore = useNotificationStore()

/**
 * Join a room as a player
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
    
    // We load the room into the state but DON'T return whatever loadRoom returns
    await loadRoom(roomId)
    
    // Instead always return our standard success object
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

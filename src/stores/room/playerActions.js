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
  loading.value = true
  
  try {
    if (!nickname) {
      notificationStore.showNotification('Please enter your nickname', 'error')
      return null
    }
    
    if (!roomId) {
      notificationStore.showNotification('Please enter a room code', 'error')
      return null
    }
    
    // Make room ID uppercase
    roomId = roomId.toUpperCase()
    
    // Get room reference
    const roomRef = doc(db, 'rooms', roomId)
    const roomDoc = await getDoc(roomRef)
    
    if (!roomDoc.exists()) {
      notificationStore.showNotification(`Room ${roomId} not found`, 'error')
      return null
    }
    
    // Get room data
    const roomData = roomDoc.data()
    
    // Check if room is active
    if (!roomData.active) {
      notificationStore.showNotification('This room is no longer active', 'error')
      return null
    }
    
    // Check if player already exists in the room
    const playerExists = (roomData.players || []).some(player => player.nickname === nickname)
    
    if (!playerExists) {
      // Create player data - Use client-side timestamp instead of serverTimestamp
      const playerData = {
        nickname: nickname,
        joinedAt: Timestamp.now() // Use client-side timestamp to avoid Firebase array issues
      }
      
      // Update room using arrayUnion to safely add to the array
      await updateDoc(roomRef, { 
        players: arrayUnion(playerData)
      })
      
      notificationStore.showNotification(`Joined room ${roomId} as ${nickname}`, 'success')
    } else {
      notificationStore.showNotification(`Resumed session in room ${roomId} as ${nickname}`, 'success')
    }
    
    // Load the room
    await loadRoom(roomId)
    
    return currentRoom.value
  } catch (error) {
    console.error('Error joining room:', error)
    notificationStore.showNotification(`Error joining room: ${error.message}`, 'error')
    return null
  } finally {
    loading.value = false
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
      return false
    }
    
    // Check if player exists in the room
    const playerExists = (currentRoom.value.players || []).some(player => player.nickname === playerName)
    if (!playerExists) {
      notificationStore.showNotification('You are not registered in this room', 'error')
      return false
    }
    
    // Check if player's grid exists
    if (!currentRoom.value.playerGrids || !currentRoom.value.playerGrids[playerName]) {
      notificationStore.showNotification('Your bingo grid is not ready yet', 'error')
      return false
    }
    
    // Get the cell in question
    const cellKey = `${row}_${col}`
    const grid = currentRoom.value.playerGrids[playerName]
    
    if (!grid[cellKey]) {
      notificationStore.showNotification('Invalid cell selection', 'error')
      return false
    }
    
    // If cell is already marked, don't allow changing
    if (grid[cellKey].marked) {
      notificationStore.showNotification('This cell is already marked', 'info')
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
    
    // Check if approval already exists (to avoid duplicates)
    const approvalExists = (currentRoom.value.pendingApprovals || []).some(
      approval => approval.playerName === playerName && approval.row === row && approval.col === col
    )
    
    // Update room data
    if (!approvalExists) {
      await updateDoc(roomRef, {
        playerGrids: playerGrids,
        pendingApprovals: arrayUnion(approvalData) // Use arrayUnion for safe array updates
      })
    } else {
      // Just update the grid if approval already exists
      await updateDoc(roomRef, {
        playerGrids: playerGrids
      })
    }
    
    notificationStore.showNotification('Cell marked! Waiting for admin approval.', 'success')
    return true
  } catch (error) {
    console.error('Error marking cell:', error)
    notificationStore.showNotification(`Error marking cell: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

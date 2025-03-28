import { currentRoom, loading, requiredWords, roomWords } from './state'
import { useNotificationStore } from '@/stores/notification'
import { doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from '@/firebase'
import { checkForBingo } from '@/utils/gridUtils'
import { generateBingoGrid } from '@/utils/gridUtils'

// Get dependencies
const notificationStore = useNotificationStore()

/**
 * Start the game - transition from setup to active
 */
export async function startGame() {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    // Check if we have enough words
    if (roomWords.value.length < requiredWords.value) {
      notificationStore.showNotification(
        `Need at least ${requiredWords.value} words to start the game`, 
        'error'
      )
      return false
    }
    
    // Update room status
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    await updateDoc(roomRef, {
      status: 'active',
      startedAt: serverTimestamp(), // This is fine as it's not in an array
      calledOutWords: [] // Initialize called out words array
    })
    
    // Assign words to player grids
    await assignPlayerGrids()
    
    notificationStore.showNotification('Game started successfully! Players can now join and play.', 'success')
    return true
  } catch (error) {
    console.error('Error starting game:', error)
    notificationStore.showNotification(`Error starting game: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Reset the game to setup mode
 */
export async function resetGame() {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    await updateDoc(roomRef, {
      status: 'setup',
      playerGrids: {}, // Clear all player grids
      pendingApprovals: [], // Clear pending approvals
      bingoWinners: [], // Clear winners
      calledOutWords: [] // Clear called out words
    })
    
    notificationStore.showNotification('Game reset to setup mode', 'success')
    return true
  } catch (error) {
    console.error('Error resetting game:', error)
    notificationStore.showNotification(`Error resetting game: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Assign random grids to all players
 */
export async function assignPlayerGrids() {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const { gridSize, words, players } = currentRoom.value
    const totalCells = gridSize * gridSize
    
    if (words.length < totalCells) {
      notificationStore.showNotification(`Not enough words for the grid size (${totalCells} needed)`, 'error')
      return false
    }
    
    // Create player grids
    const playerGrids = {}
    
    for (const player of players) {
      // Use the centralized grid generation utility - this ensures NO "FREE" cell
      playerGrids[player.nickname] = generateBingoGrid(words, gridSize)
    }
    
    // Update room with player grids
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    await updateDoc(roomRef, { playerGrids })
    
    notificationStore.showNotification('Assigned bingo grids to all players', 'success')
    return true
  } catch (error) {
    console.error('Error assigning player grids:', error)
    notificationStore.showNotification(`Error assigning player grids: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Approve a player's marked cell
 * @param {number} approvalIndex - Index of the approval in the pendingApprovals array
 */
export async function approvePlayerMark(approvalIndex) {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const pendingApprovals = [...(currentRoom.value.pendingApprovals || [])]
    if (approvalIndex < 0 || approvalIndex >= pendingApprovals.length) {
      notificationStore.showNotification('Invalid approval index', 'error')
      return false
    }
    
    const approval = pendingApprovals[approvalIndex]
    const { playerName, row, col } = approval
    const cellKey = `${row}_${col}`
    
    // Update player grid
    if (currentRoom.value.playerGrids && currentRoom.value.playerGrids[playerName]) {
      // Deep clone playerGrids to avoid modifying the original
      const playerGrids = JSON.parse(JSON.stringify(currentRoom.value.playerGrids))
      const playerGrid = playerGrids[playerName]
      
      if (playerGrid[cellKey]) {
        playerGrid[cellKey].approved = true
        
        // Remove the approval
        pendingApprovals.splice(approvalIndex, 1)
        
        // Update the room document
        const roomRef = doc(db, 'rooms', currentRoom.value.id)
        await updateDoc(roomRef, {
          playerGrids: playerGrids,
          pendingApprovals: pendingApprovals
        })
        
        notificationStore.showNotification(`Approved ${playerName}'s mark`, 'success')
        
        // Check for bingo
        const hasBingo = checkForBingo(playerGrid, currentRoom.value.gridSize)
        if (hasBingo) {
          notificationStore.showNotification(`${playerName} has BINGO!`, 'success')
          
          // Update bingo winners using arrayUnion
          if (!currentRoom.value.bingoWinners?.includes(playerName)) {
            await updateDoc(roomRef, { 
              bingoWinners: arrayUnion(playerName)
            })
          }
        }
        
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error approving mark:', error)
    notificationStore.showNotification(`Error approving mark: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Reject a player's marked cell
 * @param {number} approvalIndex - Index of the approval in the pendingApprovals array
 */
export async function rejectPlayerMark(approvalIndex) {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const pendingApprovals = [...(currentRoom.value.pendingApprovals || [])]
    if (approvalIndex < 0 || approvalIndex >= pendingApprovals.length) {
      notificationStore.showNotification('Invalid approval index', 'error')
      return false
    }
    
    const approval = pendingApprovals[approvalIndex]
    const { playerName, row, col } = approval
    const cellKey = `${row}_${col}`
    
    // Update player grid
    if (currentRoom.value.playerGrids && currentRoom.value.playerGrids[playerName]) {
      // Deep clone playerGrids to avoid modifying the original
      const playerGrids = JSON.parse(JSON.stringify(currentRoom.value.playerGrids))
      const playerGrid = playerGrids[playerName]
      
      if (playerGrid[cellKey]) {
        playerGrid[cellKey].marked = false
        playerGrid[cellKey].approved = false
        
        // Remove the approval
        pendingApprovals.splice(approvalIndex, 1)
        
        // Update the room document
        const roomRef = doc(db, 'rooms', currentRoom.value.id)
        await updateDoc(roomRef, {
          playerGrids: playerGrids,
          pendingApprovals: pendingApprovals
        })
        
        notificationStore.showNotification(`Rejected ${playerName}'s mark`, 'success')
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error rejecting mark:', error)
    notificationStore.showNotification(`Error rejecting mark: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Reset called out words
 */
export async function resetCalledOutWords() {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    await updateDoc(roomRef, {
      calledOutWords: []
    })
    
    notificationStore.showNotification('Reset called out words', 'success')
    return true
  } catch (error) {
    console.error('Error resetting called out words:', error)
    notificationStore.showNotification(`Error: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}
import { currentRoom, loading, roomWords } from './state'
import { useNotificationStore } from '@/stores/notification'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/firebase'

// Get dependencies
const notificationStore = useNotificationStore()

/**
 * Add multiple words to the current room at once
 * @param {Array<string>} words - Words to add
 */
export async function addMultipleWords(words) {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  if (!Array.isArray(words) || words.length === 0) {
    notificationStore.showNotification('No words provided to add', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    
    // For a large number of words, it's better to update the whole array
    // rather than using arrayUnion multiple times
    const existingWords = [...roomWords.value]
    const uniqueNewWords = words.filter(word => !existingWords.includes(word))
    const updatedWords = [...existingWords, ...uniqueNewWords]
    
    // Update the document
    await updateDoc(roomRef, { words: updatedWords })
    
    notificationStore.showNotification(`Added ${uniqueNewWords.length} words to the word list`, 'success')
    return true
  } catch (error) {
    console.error('Error adding words:', error)
    notificationStore.showNotification(`Error adding words: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Add a word to the current room
 * @param {string} word - Word to add
 */
export async function addWord(word) {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  if (!word) {
    notificationStore.showNotification('Please enter a word or phrase', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    
    // Use arrayUnion to safely add the word
    await updateDoc(roomRef, { 
      words: arrayUnion(word) 
    })
    
    notificationStore.showNotification(`Added "${word}" to the word list`, 'success')
    return true
  } catch (error) {
    console.error('Error adding word:', error)
    notificationStore.showNotification(`Error adding word: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Remove a word from the current room
 * @param {number} index - Index of the word to remove
 */
export async function removeWord(index) {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    const words = [...roomWords.value]
    
    if (index >= 0 && index < words.length) {
      const wordToRemove = words[index]
      
      // Use arrayRemove for a single word removal
      const roomRef = doc(db, 'rooms', currentRoom.value.id)
      await updateDoc(roomRef, { 
        words: arrayRemove(wordToRemove) 
      })
      
      notificationStore.showNotification(`Removed "${wordToRemove}" from the word list`, 'success')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error removing word:', error)
    notificationStore.showNotification(`Error removing word: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Mark a word as called out on the admin's master grid
 * @param {string} word - Word to mark as called out
 */
export async function markWordForAllPlayers(word) {
  if (!currentRoom.value) {
    notificationStore.showNotification('No room selected', 'error')
    return false
  }
  
  if (currentRoom.value.status !== 'active') {
    notificationStore.showNotification('Game must be active to call out words', 'error')
    return false
  }
  
  loading.value = true
  
  try {
    // Check if the word exists in the room's word list
    if (!currentRoom.value.words.includes(word)) {
      notificationStore.showNotification(`"${word}" is not in your word list`, 'error')
      return false
    }
    
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    
    // Toggle called out state
    const isAlreadyCalled = (currentRoom.value.calledOutWords || []).includes(word)
    
    if (isAlreadyCalled) {
      // Remove the word from called out words using arrayRemove
      await updateDoc(roomRef, {
        calledOutWords: arrayRemove(word)
      })
      notificationStore.showNotification(`"${word}" removed from called words`, 'info')
    } else {
      // Add the word to called out words using arrayUnion
      await updateDoc(roomRef, {
        calledOutWords: arrayUnion(word)
      })
      notificationStore.showNotification(`"${word}" called out!`, 'success')
    }
    
    // Auto-mark cells in all player grids that contain this word
    await autoMarkCellsWithWord(word, !isAlreadyCalled)
    
    return true
  } catch (error) {
    console.error('Error marking word for all players:', error)
    notificationStore.showNotification(`Error marking word: ${error.message}`, 'error')
    return false
  } finally {
    loading.value = false
  }
}

/**
 * Auto-mark cells in all player grids that contain a specific word
 * @param {string} word - The word to mark
 * @param {boolean} marked - Whether to mark or unmark the cells
 */
async function autoMarkCellsWithWord(word, marked = true) {
  if (!currentRoom.value || !currentRoom.value.playerGrids) {
    return false
  }
  
  try {
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    
    // Create deep clone of player grids
    const playerGrids = JSON.parse(JSON.stringify(currentRoom.value.playerGrids))
    let pendingApprovals = [...(currentRoom.value.pendingApprovals || [])]
    let hasChanges = false
    
    // For each player grid
    for (const playerName in playerGrids) {
      const grid = playerGrids[playerName]
      
      // For each cell in the grid
      for (const cellKey in grid) {
        const cell = grid[cellKey]
        
        // If the cell contains the target word and is not "FREE"
        if (cell.word === word && cell.word !== "FREE") {
          // We're either marking or unmarking the word
          if (marked) {
            // Mark and auto-approve the cell
            cell.marked = true
            cell.approved = true
            
            // Remove any pending approvals for this cell
            const [row, col] = cellKey.split('_').map(Number)
            pendingApprovals = pendingApprovals.filter(
              approval => !(approval.playerName === playerName && approval.row === row && approval.col === col)
            )
          } else {
            // Unmark the cell only if it was previously auto-approved
            // Don't unmark cells that were manually marked by the player
            if (cell.approved) {
              cell.marked = false
              cell.approved = false
            }
          }
          
          hasChanges = true
        }
      }
    }
    
    if (hasChanges) {
      try {
        // Update player grids and pending approvals
        await updateDoc(roomRef, {
          playerGrids,
          pendingApprovals
        })
        
        // Check for any new bingos or removed bingos
        await updateBingoStatus(playerGrids)
        
        return true
      } catch (error) {
        console.error('Error updating player grids:', error)
        
        // Try a more conservative approach if the update failed
        if (error.message && (error.message.includes('Document was mutated') || error.message.includes('network error'))) {
          // Fetch the latest document and retry
          notificationStore.showNotification('Retrying update due to concurrent changes...', 'info')
          
          // Instead of failing, we'll retry the operation later
          setTimeout(() => {
            autoMarkCellsWithWord(word, marked)
          }, 1000)
        }
        return false
      }
    }
    
    return false
  } catch (error) {
    console.error('Error auto-marking cells:', error)
    notificationStore.showNotification(`Error updating player grids: ${error.message}`, 'error')
    return false
  }
}

/**
 * Update bingo status for all players
 * @param {Object} playerGrids - All player grids
 */
async function updateBingoStatus(playerGrids) {
  if (!currentRoom.value) return false
  
  try {
    const roomRef = doc(db, 'rooms', currentRoom.value.id)
    let bingoWinners = [...(currentRoom.value.bingoWinners || [])]
    let hasChanges = false
    
    // For each player grid
    for (const playerName in playerGrids) {
      const playerGrid = playerGrids[playerName]
      const hasBingo = checkForBingo(playerGrid, currentRoom.value.gridSize)
      
      // If player has bingo and is not already in winners list
      if (hasBingo && !bingoWinners.includes(playerName)) {
        bingoWinners.push(playerName)
        hasChanges = true
        notificationStore.showNotification(`${playerName} has BINGO!`, 'success')
      }
      // If player doesn't have bingo anymore but is in winners list
      else if (!hasBingo && bingoWinners.includes(playerName)) {
        bingoWinners = bingoWinners.filter(winner => winner !== playerName)
        hasChanges = true
        notificationStore.showNotification(`${playerName} no longer has BINGO.`, 'info')
      }
    }
    
    if (hasChanges) {
      try {
        await updateDoc(roomRef, { 
          bingoWinners 
        })
        return true
      } catch (error) {
        console.error('Error updating bingo winners:', error)
        return false
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking for bingos:', error)
    return false
  }
}

/**
 * Check if a player has achieved bingo
 * @param {Object} playerGrid - Player's grid
 * @param {number} gridSize - Grid size
 * @returns {boolean} Whether bingo is achieved
 */
function checkForBingo(playerGrid, gridSize) {
  // Create a 2D array representation of marked & approved cells
  const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(false))
  
  // Fill in the grid with marked and approved cells
  for (const cellKey in playerGrid) {
    const cell = playerGrid[cellKey]
    if (cell.marked && cell.approved) {
      const [row, col] = cellKey.split('_').map(Number)
      grid[row][col] = true
    }
  }
  
  // Check rows
  for (let i = 0; i < gridSize; i++) {
    let rowBingo = true
    for (let j = 0; j < gridSize; j++) {
      if (!grid[i][j]) {
        rowBingo = false
        break
      }
    }
    if (rowBingo) return true
  }
  
  // Check columns
  for (let j = 0; j < gridSize; j++) {
    let colBingo = true
    for (let i = 0; i < gridSize; i++) {
      if (!grid[i][j]) {
        colBingo = false
        break
      }
    }
    if (colBingo) return true
  }
  
  // Check diagonal (top-left to bottom-right)
  let diag1Bingo = true
  for (let i = 0; i < gridSize; i++) {
    if (!grid[i][i]) {
      diag1Bingo = false
      break
    }
  }
  if (diag1Bingo) return true
  
  // Check diagonal (top-right to bottom-left)
  let diag2Bingo = true
  for (let i = 0; i < gridSize; i++) {
    if (!grid[i][gridSize - 1 - i]) {
      diag2Bingo = false
      break
    }
  }
  
  return diag2Bingo
}

// Export the checkForBingo function for use in other modules
export { checkForBingo }

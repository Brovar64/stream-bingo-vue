import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'

export const useRoomStore = defineStore('room', () => {
  // Dependencies
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  
  // State
  const currentRoom = ref(null)
  const userRooms = ref([])
  const loading = ref(false)
  const unsubscribeRoomListener = ref(null)
  
  // Getters
  const isRoomLoaded = computed(() => !!currentRoom.value)
  const isRoomActive = computed(() => currentRoom.value?.status === 'active')
  const isRoomSetup = computed(() => currentRoom.value?.status === 'setup')
  const roomWords = computed(() => currentRoom.value?.words || [])
  const roomPlayers = computed(() => currentRoom.value?.players || [])
  const pendingApprovals = computed(() => currentRoom.value?.pendingApprovals || [])
  const playerGrids = computed(() => currentRoom.value?.playerGrids || {})
  const bingoWinners = computed(() => currentRoom.value?.bingoWinners || [])
  
  // Calculate required words for the current grid size
  const requiredWords = computed(() => {
    if (!currentRoom.value) return 0
    const gridSize = currentRoom.value.gridSize || 5
    return gridSize * gridSize
  })
  
  // Actions
  
  /**
   * Create a new bingo room
   * @param {string} roomCode - Room code/ID
   * @param {number} gridSize - Grid size (3, 4, or 5)
   */
  async function createRoom(roomCode, gridSize = 5) {
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
        words: [], // Will be populated by admin later
        pendingApprovals: [] // For tracking player marks that need admin approval
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
  async function loadRoom(roomId) {
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
  async function loadUserRooms() {
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
   * Add a word to the current room
   * @param {string} word - Word to add
   */
  async function addWord(word) {
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
      
      // Get existing words
      const words = [...roomWords.value, word]
      
      // Update the document
      await updateDoc(roomRef, { words })
      
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
  async function removeWord(index) {
    if (!currentRoom.value) {
      notificationStore.showNotification('No room selected', 'error')
      return false
    }
    
    loading.value = true
    
    try {
      const words = [...roomWords.value]
      
      if (index >= 0 && index < words.length) {
        const wordToRemove = words[index]
        words.splice(index, 1)
        
        // Update the document
        const roomRef = doc(db, 'rooms', currentRoom.value.id)
        await updateDoc(roomRef, { words })
        
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
   * Start the game - transition from setup to active
   */
  async function startGame() {
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
        startedAt: serverTimestamp()
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
  async function resetGame() {
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
        bingoWinners: [] // Clear winners
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
  async function assignPlayerGrids() {
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
        // Shuffle words and pick the first gridSize*gridSize words
        const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, totalCells)
        
        // Create flat grid object
        const grid = {}
        
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            const index = i * gridSize + j
            const cellKey = `${i}_${j}`
            
            grid[cellKey] = {
              word: shuffledWords[index],
              marked: false,
              approved: false,
              row: i,
              col: j
            }
          }
        }
        
        // Add free space in the middle for odd-sized grids
        if (gridSize % 2 === 1) {
          const middleRow = Math.floor(gridSize / 2)
          const middleCol = Math.floor(gridSize / 2)
          const middleCellKey = `${middleRow}_${middleCol}`
          
          grid[middleCellKey] = {
            word: "FREE",
            marked: true,
            approved: true,
            row: middleRow,
            col: middleCol
          }
        }
        
        playerGrids[player.nickname] = grid
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
   * Join a room as a player
   * @param {string} nickname - Player nickname
   * @param {string} roomId - Room ID to join
   */
  async function joinRoom(nickname, roomId) {
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
      
      // Add player to the room if not already present
      const playerExists = (roomData.players || []).some(player => player.nickname === nickname)
      
      if (!playerExists) {
        // Create player data
        const playerData = {
          nickname: nickname,
          joinedAt: serverTimestamp()
        }
        
        // Add to players array
        const players = [...(roomData.players || []), playerData]
        
        // Update room
        await updateDoc(roomRef, { players })
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
  async function markCell(playerName, row, col) {
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
      
      // Create approval request for admin
      const pendingApprovals = [...(currentRoom.value.pendingApprovals || [])]
      
      // Check if approval already exists
      const approvalExists = pendingApprovals.some(
        approval => approval.playerName === playerName && approval.row === row && approval.col === col
      )
      
      if (!approvalExists) {
        pendingApprovals.push({
          playerName: playerName,
          row: row,
          col: col,
          word: grid[cellKey].word,
          timestamp: serverTimestamp()
        })
      }
      
      // Update room data
      await updateDoc(roomRef, {
        playerGrids: playerGrids,
        pendingApprovals: pendingApprovals
      })
      
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
  
  /**
   * Approve a player's marked cell
   * @param {number} approvalIndex - Index of the approval in the pendingApprovals array
   */
  async function approvePlayerMark(approvalIndex) {
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
            
            // Update bingo winners
            let winners = [...(currentRoom.value.bingoWinners || [])]
            if (!winners.includes(playerName)) {
              winners.push(playerName)
              await updateDoc(roomRef, { bingoWinners: winners })
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
  async function rejectPlayerMark(approvalIndex) {
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
   * Delete a room by ID
   * @param {string} roomId - ID of the room to delete
   */
  async function deleteRoom(roomId) {
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
  
  // Clean up on unmount
  function cleanup() {
    if (unsubscribeRoomListener.value) {
      unsubscribeRoomListener.value()
      unsubscribeRoomListener.value = null
    }
    currentRoom.value = null
  }
  
  return {
    // State
    currentRoom,
    userRooms,
    loading,
    
    // Getters
    isRoomLoaded,
    isRoomActive,
    isRoomSetup,
    roomWords,
    roomPlayers,
    pendingApprovals,
    playerGrids,
    bingoWinners,
    requiredWords,
    
    // Actions
    createRoom,
    loadRoom,
    loadUserRooms,
    addWord,
    removeWord,
    startGame,
    resetGame,
    assignPlayerGrids,
    joinRoom,
    markCell,
    approvePlayerMark,
    rejectPlayerMark,
    deleteRoom,
    checkForBingo,
    cleanup
  }
})

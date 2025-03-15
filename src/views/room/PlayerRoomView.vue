
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'PlayerRoomView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const roomStore = useRoomStore()
    const notificationStore = useNotificationStore()
    const authStore = useAuthStore()
    
    // Get room ID from route params
    const roomId = route.params.id
    
    // State
    const loading = ref(true)
    const loadError = ref(false)
    const loadErrorMessage = ref('')
    const loadingPlayerGrid = ref(false)
    const boardLoadAttempts = ref(0)
    
    console.log(`[PLAYER ROOM] Initializing with room ID: ${roomId}`)
    
    // Computed properties
    const roomData = computed(() => roomStore.currentRoom)
    const isRoomActive = computed(() => {
      const active = roomData.value?.status === 'active'
      console.log(`[PLAYER ROOM] Room active status: ${active}`)
      return active
    })
    const gridSize = computed(() => roomData.value?.gridSize || 5)
    const username = computed(() => authStore.username)
    
    // Get the player's grid
    const playerGrid = computed(() => {
      if (!roomData.value?.playerGrids || !username.value) return null
      return roomData.value.playerGrids[username.value] || null
    })
    
    // Check if the player grid has data
    const hasValidPlayerGrid = computed(() => {
      const hasGrid = playerGrid.value && Object.keys(playerGrid.value).length > 0
      console.log(`[PLAYER ROOM] Has valid player grid: ${hasGrid}`)
      
      if (playerGrid.value) {
        console.log(`[PLAYER ROOM] Player grid keys: ${Object.keys(playerGrid.value).length}`)
      }
      
      return hasGrid
    })
    
    // Check if player has won
    const hasWon = computed(() => {
      if (!roomData.value?.bingoWinners) return false
      return roomData.value.bingoWinners.includes(username.value)
    })
    
    // Cell stats
    const markedCellsCount = computed(() => {
      if (!playerGrid.value) return 0
      return Object.values(playerGrid.value).filter(cell => cell.marked).length
    })
    
    const approvedCellsCount = computed(() => {
      if (!playerGrid.value) return 0
      return Object.values(playerGrid.value).filter(cell => cell.marked && cell.approved).length
    })
    
    const pendingApprovalCount = computed(() => {
      if (!playerGrid.value) return 0
      return Object.values(playerGrid.value).filter(cell => cell.marked && !cell.approved).length
    })
    
    // Watch for player grid and room status changes
    watch(() => [playerGrid.value, roomData.value?.status], ([_, newStatus]) => {
      console.log(`[PLAYER ROOM] Watch triggered - grid changed or status changed to: ${newStatus}`)
      
      if (newStatus === 'active' && !loadingPlayerGrid.value && !hasValidPlayerGrid.value) {
        console.log('[PLAYER ROOM] Room is active but no valid grid, triggering grid load')
        loadPlayerGrid()
      }
    })
    
    // Load room data on component mount
    onMounted(async () => {
      console.log('[PLAYER ROOM] Component mounted')
      loading.value = true
      
      try {
        // Check authentication
        if (!authStore.username) {
          console.log('[PLAYER ROOM] No username found, redirecting to dashboard')
          notificationStore.showNotification('You must be logged in to join a room', 'error')
          router.push('/dashboard')
          return
        }
        
        console.log(`[PLAYER ROOM] Starting initial load for room ${roomId}`)
        
        // Attempt to load the room data
        await loadInitialRoomData()
        
        loading.value = false
      } catch (error) {
        console.error('[PLAYER ROOM] Error during initial load:', error)
        loadError.value = true
        loadErrorMessage.value = error.message || 'Error loading room'
        loading.value = false
      }
    })
    
    // Initial room data loading
    async function loadInitialRoomData() {
      console.log('[PLAYER ROOM] loadInitialRoomData called')
      
      try {
        // First, load the room to check if it exists
        await roomStore.loadRoom(roomId)
        
        if (!roomData.value) {
          console.log('[PLAYER ROOM] Room not found in initial load')
          throw new Error(`Room ${roomId} not found`)
        }
        
        console.log(`[PLAYER ROOM] Room loaded, status: ${roomData.value.status}`)
        
        // Now join the room with the current username
        const joinResult = await roomStore.joinRoom(username.value, roomId)
        
        if (!joinResult || !joinResult.success) {
          console.log('[PLAYER ROOM] Failed to join room')
          throw new Error('Failed to join the room. Please try again.')
        }
        
        console.log('[PLAYER ROOM] Successfully joined room')
        
        // If room is active, start loading the player grid
        if (isRoomActive.value) {
          console.log('[PLAYER ROOM] Room is active, loading player grid')
          await loadPlayerGrid()
        }
        
        return true
      } catch (error) {
        console.error('[PLAYER ROOM] Error in loadInitialRoomData:', error)
        loadError.value = true
        loadErrorMessage.value = error.message || 'Failed to load room data'
        return false
      }
    }
    
    // Try to load player grid
    async function loadPlayerGrid() {
      if (loadingPlayerGrid.value) return false
      
      console.log('[PLAYER ROOM] loadPlayerGrid called, attempt #', boardLoadAttempts.value + 1)
      boardLoadAttempts.value++
      loadingPlayerGrid.value = true
      
      try {
        if (!username.value || !roomId) {
          console.log('[PLAYER ROOM] Missing username or roomId for grid load')
          loadingPlayerGrid.value = false
          return false
        }
        
        // Reload the room to get fresh data
        console.log('[PLAYER ROOM] Reloading room data for grid')
        await roomStore.loadRoom(roomId)
        
        // Force a short wait to make sure data is loaded
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if we have a grid now
        if (hasValidPlayerGrid.value) {
          console.log('[PLAYER ROOM] Successfully loaded player grid')
          loadingPlayerGrid.value = false
          return true
        }
        
        console.log('[PLAYER ROOM] Grid not loaded yet, trying to join again')
        
        // Try joining again if we don't have a grid
        await roomStore.joinRoom(username.value, roomId)
        
        // Wait again before checking
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Reload once more
        await roomStore.loadRoom(roomId)
        
        // After multiple attempts with no success, show error
        if (boardLoadAttempts.value >= 3 && !hasValidPlayerGrid.value) {
          console.log('[PLAYER ROOM] Failed to load grid after multiple attempts')
          loadError.value = true
          loadErrorMessage.value = 'Unable to load your bingo board. The game may not be properly set up.'
          loadingPlayerGrid.value = false
          return false
        }
        
        loadingPlayerGrid.value = false
        return hasValidPlayerGrid.value
      } catch (error) {
        console.error('[PLAYER ROOM] Error loading player grid:', error)
        if (boardLoadAttempts.value >= 3) {
          loadError.value = true
          loadErrorMessage.value = error.message || 'Failed to load your bingo board'
        }
        loadingPlayerGrid.value = false
        return false
      }
    }
    
    // Retry loading room and player grid
    async function retryLoading() {
      console.log('[PLAYER ROOM] retryLoading called')
      loadError.value = false
      loading.value = true
      boardLoadAttempts.value = 0
      
      try {
        await loadInitialRoomData()
        
        if (isRoomActive.value && !hasValidPlayerGrid.value) {
          await loadPlayerGrid()
        }
        
        loading.value = false
      } catch (error) {
        console.error('[PLAYER ROOM] Error in retryLoading:', error)
        loadError.value = true
        loadErrorMessage.value = error.message || 'Error reloading room'
        loading.value = false
      }
    }
    
    // Cleanup on component unmount
    onUnmounted(() => {
      console.log('[PLAYER ROOM] Component unmounting, cleaning up')
      roomStore.cleanup()
    })
    
    // Mark a cell
    async function markCell(row, col) {
      if (!roomData.value || !isRoomActive.value || !username.value || !hasValidPlayerGrid.value) {
        console.log('[PLAYER ROOM] Cannot mark cell - missing data or inactive room')
        return
      }
      
      // Get the cell
      const cellKey = `${row}_${col}`
      const cell = playerGrid.value?.[cellKey]
      
      if (!cell) {
        console.log(`[PLAYER ROOM] Cell not found: ${cellKey}`)
        return
      }
      
      // Don't allow marking if already marked
      if (cell.marked) {
        console.log(`[PLAYER ROOM] Cell ${cellKey} is already marked`)
        notificationStore.showNotification('This cell is already marked', 'info')
        return
      }
      
      try {
        console.log(`[PLAYER ROOM] Marking cell ${cellKey}`)
        // Mark the cell
        await roomStore.markCell(username.value, row, col)
      } catch (error) {
        console.error(`[PLAYER ROOM] Error marking cell ${cellKey}:`, error)
        notificationStore.showNotification(`Error marking cell: ${error.message}`, 'error')
      }
    }
    
    // Get CSS classes for a cell based on its state
    function getCellClasses(cellKey) {
      if (!playerGrid.value || !playerGrid.value[cellKey]) return ''
      
      const cell = playerGrid.value[cellKey]
      const classes = []
      
      if (cell.marked && cell.approved) {
        classes.push('marked approved')
      } else if (cell.marked) {
        classes.push('marked pending')
      }
      
      return classes.join(' ')
    }
    
    // Get the word for a cell
    function getCellWord(cellKey) {
      if (!playerGrid.value || !playerGrid.value[cellKey]) return ''
      return playerGrid.value[cellKey].word
    }
    
    // Get the state of a cell
    function getCellState(cellKey) {
      if (!playerGrid.value || !playerGrid.value[cellKey]) return ''
      
      const cell = playerGrid.value[cellKey]
      
      if (cell.marked && cell.approved) {
        return 'approved'
      } else if (cell.marked) {
        return 'pending'
      }
      
      return 'unmarked'
    }
    
    return {
      loading,
      loadingPlayerGrid,
      username,
      roomData,
      isRoomActive,
      gridSize,
      playerGrid,
      hasValidPlayerGrid,
      hasWon,
      markedCellsCount,
      approvedCellsCount,
      pendingApprovalCount,
      loadError,
      loadErrorMessage,
      markCell,
      getCellClasses,
      getCellWord,
      getCellState,
      retryLoading,
      loadPlayerGrid
    }
  }
}

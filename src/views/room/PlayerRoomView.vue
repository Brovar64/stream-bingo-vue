<template>
  <div class="container py-8">
    <!-- Loading state -->
    <div v-if="loading || !roomData" class="text-center py-16">
      <div class="spinner mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold">Loading Room</h2>
      <p class="text-gray-400">Please wait...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="loadError" class="text-center py-16">
      <div class="text-error mb-4 text-5xl">⚠️</div>
      <h2 class="text-xl font-semibold mb-2">Error Loading Game</h2>
      <p class="text-gray-400 mb-6">{{ loadErrorMessage }}</p>
      <div class="flex justify-center space-x-4">
        <button @click="retryLoading" class="btn bg-primary hover:bg-primary-dark text-white">
          Retry
        </button>
        <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
          Back to Dashboard
        </router-link>
      </div>
    </div>
    
    <!-- Game not active / waiting state -->
    <div v-else-if="!isRoomActive" class="text-center py-16">
      <h2 class="text-2xl font-semibold mb-2">Waiting for Game to Start</h2>
      <p class="text-gray-400 mb-8">The streamer is setting up the game. Please wait.</p>
      
      <div class="waiting-animation">
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <p class="text-gray-400">Room Status: {{ roomData.status }}</p>
      </div>
      
      <div class="mt-12">
        <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
          Back to Dashboard
        </router-link>
      </div>
    </div>
    
    <!-- Active game -->
    <div v-else>
      <!-- Header section -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="title">Bingo: {{ roomData.id }}</h1>
            <span class="status-badge bg-success">Active</span>
          </div>
          <p class="subtitle">Playing as: {{ username }}</p>
        </div>
        
        <div class="flex gap-3 mt-4 md:mt-0">
          <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
            Back to Dashboard
          </router-link>
        </div>
      </div>
      
      <!-- Game info section -->
      <div class="card p-5 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="status-item">
            <span class="status-label">Marked Cells</span>
            <span class="status-count">{{ markedCellsCount }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Pending Approval</span>
            <span class="status-count">{{ pendingApprovalCount }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Approved Cells</span>
            <span class="status-count">{{ approvedCellsCount }}</span>
          </div>
        </div>
      </div>
      
      <!-- Bingo card -->
      <div class="flex flex-col items-center mb-8">
        <div v-if="hasWon" class="bg-background-card p-4 rounded-lg mb-6 text-center">
          <h2 class="text-2xl font-bold text-yellow-400">🎉 BINGO! You Won! 🎉</h2>
          <p class="text-gray-300">Congratulations on achieving bingo!</p>
        </div>
        
        <div v-if="loadingPlayerGrid" class="text-center py-8">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-gray-400 mb-3">Your bingo board is being prepared...</p>
          <p class="text-sm text-gray-500">This may take a few seconds. If it doesn't appear soon, try refreshing the page.</p>
        </div>
        
        <div v-else-if="!hasValidPlayerGrid" class="text-center py-8">
          <p class="text-gray-400 mb-6">We couldn't load your bingo board. Please try reloading it.</p>
          <button 
            @click="loadPlayerGrid" 
            class="btn bg-primary hover:bg-primary-dark text-white"
          >
            Reload Board
          </button>
        </div>
        
        <div v-else>
          <div class="bingo-grid" :style="`grid-template-columns: repeat(${gridSize}, 1fr);`">
            <template v-for="row in gridSize" :key="`row-${row}`">
              <div 
                v-for="col in gridSize" 
                :key="`${row-1}_${col-1}`"
                :class="['bingo-cell', getCellClasses(`${row-1}_${col-1}`)]"
                @click="markCell(row-1, col-1)"
              >
                <div class="bingo-cell-content">
                  {{ getCellWord(`${row-1}_${col-1}`) }}
                </div>
                <div v-if="getCellState(`${row-1}_${col-1}`) === 'approved'" class="cell-status-icon approved">✓</div>
                <div v-else-if="getCellState(`${row-1}_${col-1}`) === 'pending'" class="cell-status-icon pending">⌛</div>
              </div>
            </template>
          </div>
          
          <div class="text-center mt-4">
            <p class="text-sm text-gray-400">Click a cell to mark when an event happens</p>
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="card p-5">
        <h3 class="text-lg font-semibold mb-3">How to Play</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-background-lighter p-3 rounded-lg">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-background-lighter border-2 border-gray-600 rounded mr-2"></div>
              <span>Not Marked</span>
            </div>
          </div>
          <div class="bg-background-lighter p-3 rounded-lg">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-yellow-900/20 border-2 border-dashed border-warning rounded mr-2"></div>
              <span>Pending Approval</span>
            </div>
          </div>
          <div class="bg-background-lighter p-3 rounded-lg">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-900/20 border-2 border-success rounded mr-2"></div>
              <span>Approved</span>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-4">
          Get 5 in a row (horizontally, vertically, or diagonally) to win!
        </p>
      </div>
    </div>
  </div>
</template>

<script>
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
    watch(() => [playerGrid.value, roomData.value?.status], ([newGrid, newStatus]) => {
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
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}

.bingo-grid {
  display: grid;
  grid-gap: 8px;
  width: 100%;
  max-width: 600px;
}

.bingo-cell {
  aspect-ratio: 1;
  background-color: theme('colors.background.lighter');
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 0.9rem;
  text-align: center;
  padding: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.bingo-cell:hover:not(.marked) {
  transform: scale(1.02);
  background-color: theme('colors.background.card');
}

.bingo-cell-content {
  width: 100%;
  overflow-wrap: break-word;
  hyphens: auto;
}

.bingo-cell.marked.approved {
  background-color: rgba(76, 175, 80, 0.2);
  border: 2px solid theme('colors.success');
}

.bingo-cell.marked.pending {
  background-color: rgba(255, 160, 0, 0.2);
  border: 2px dashed theme('colors.warning');
}

.cell-status-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.7rem;
}

.cell-status-icon.approved {
  background-color: theme('colors.success');
  color: white;
}

.cell-status-icon.pending {
  background-color: theme('colors.warning');
  color: white;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-label {
  font-size: 0.9rem;
  color: #B0BEC5;
}

.status-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: #FF4081;
}

.waiting-animation {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dots {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  background-color: #FF4081;
  border-radius: 50%;
  animation: dot-pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
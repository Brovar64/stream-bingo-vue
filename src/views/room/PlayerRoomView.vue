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
      <div class="flex justify-center">
        <button @click="retryLoading" class="btn bg-primary hover:bg-primary-dark text-white mr-4">
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
        
        <div v-if="!hasPlayerGrid" class="text-center py-8">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-gray-400 mb-3">Your bingo board is being prepared...</p>
          <p class="text-sm text-gray-500">This may take a few seconds. If it doesn't appear soon, try refreshing the page.</p>
          <button 
            @click="loadPlayerGrid" 
            class="btn bg-primary hover:bg-primary-dark text-white mt-4"
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
    const boardLoadAttempts = ref(0)
    
    // Computed properties
    const roomData = computed(() => roomStore.currentRoom)
    const isRoomActive = computed(() => roomStore.isRoomActive)
    const gridSize = computed(() => roomData.value?.gridSize || 5)
    const username = computed(() => authStore.username)
    
    // Get the player's grid
    const playerGrid = computed(() => {
      if (!roomData.value?.playerGrids || !username.value) return null
      return roomData.value.playerGrids[username.value] || null
    })
    
    // Updated: explicit check if player grid exists and has data
    const hasPlayerGrid = computed(() => {
      if (!playerGrid.value) return false
      return Object.keys(playerGrid.value).length > 0
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
    
    // Watch for player grid changes
    watch(() => playerGrid.value, (newGrid) => {
      if (newGrid && Object.keys(newGrid).length > 0) {
        // Player grid loaded successfully
        loadError.value = false
      } else if (isRoomActive.value && boardLoadAttempts.value > 0) {
        // If room is active but no grid found after load attempts
        if (boardLoadAttempts.value >= 3) {
          loadError.value = true
          loadErrorMessage.value = 'Could not load your bingo board. The admin may need to reset the game.'
        }
      }
    })
    
    // Watch for room data changes to detect errors
    watch(() => roomData.value, (newRoomData) => {
      if (!newRoomData && boardLoadAttempts.value > 0) {
        loadError.value = true
        loadErrorMessage.value = 'Error loading room data. Please try again.'
      }
    })
    
    // Load room data on component mount
    onMounted(async () => {
      loading.value = true
      
      try {
        // Always use the current logged-in username
        if (!authStore.username) {
          // If not logged in, redirect to dashboard
          notificationStore.showNotification('You must be logged in to join a room', 'error')
          router.push('/dashboard')
          return
        }
        
        // First join the room with the current username
        const joinResult = await roomStore.joinRoom(username.value, roomId)
        
        if (!joinResult) {
          loadError.value = true
          loadErrorMessage.value = 'Failed to join the room. Please try again.'
          loading.value = false
          return
        }
        
        // Start checking for player grid if room is active
        if (isRoomActive.value) {
          await loadPlayerGrid()
        }
        
        loading.value = false
      } catch (error) {
        console.error('Error loading room:', error)
        loadError.value = true
        loadErrorMessage.value = error.message || 'Error loading room'
        loading.value = false
      }
    })
    
    // Load room data
    async function loadRoom() {
      try {
        await roomStore.loadRoom(roomId)
        return true
      } catch (error) {
        console.error('Error loading room:', error)
        loadError.value = true
        loadErrorMessage.value = error.message || 'Failed to load room data'
        return false
      }
    }
    
    // Try to load player grid
    async function loadPlayerGrid() {
      boardLoadAttempts.value++
      
      if (!username.value || !roomId) return false
      
      try {
        // First ensure we have the latest room data
        await roomStore.loadRoom(roomId)
        
        // If we still don't have a player grid after room load
        if (isRoomActive.value && (!playerGrid.value || Object.keys(playerGrid.value).length === 0)) {
          // Re-join the room to ensure player is registered
          await roomStore.joinRoom(username.value, roomId)
          
          // Try loading the room one more time
          await roomStore.loadRoom(roomId)
          
          // If still no grid after 3 attempts, show error
          if (boardLoadAttempts.value >= 3 && (!playerGrid.value || Object.keys(playerGrid.value).length === 0)) {
            loadError.value = true
            loadErrorMessage.value = 'Unable to load your bingo board. Please try again later.'
          }
        }
        
        return true
      } catch (error) {
        console.error('Error loading player grid:', error)
        if (boardLoadAttempts.value >= 3) {
          loadError.value = true
          loadErrorMessage.value = error.message || 'Failed to load your bingo board'
        }
        return false
      }
    }
    
    // Retry loading room and player grid
    async function retryLoading() {
      loadError.value = false
      loading.value = true
      boardLoadAttempts.value = 0
      
      await loadRoom()
      
      if (isRoomActive.value) {
        await loadPlayerGrid()
      }
      
      loading.value = false
    }
    
    // Cleanup on component unmount
    onUnmounted(() => {
      roomStore.cleanup()
    })
    
    // Methods
    
    // Mark a cell
    async function markCell(row, col) {
      if (!roomData.value || !isRoomActive.value || !username.value) return
      
      // Get the cell
      const cellKey = `${row}_${col}`
      const cell = playerGrid.value?.[cellKey]
      
      if (!cell) return
      
      // Don't allow marking if already marked
      if (cell.marked) {
        notificationStore.showNotification('This cell is already marked', 'info')
        return
      }
      
      try {
        // Mark the cell
        await roomStore.markCell(username.value, row, col)
      } catch (error) {
        console.error('Error marking cell:', error)
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
      username,
      roomData,
      isRoomActive,
      gridSize,
      playerGrid,
      hasPlayerGrid,
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
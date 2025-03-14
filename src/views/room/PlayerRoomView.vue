<template>
  <div class="container py-8">
    <!-- Loading state -->
    <div v-if="loading || !roomData" class="text-center py-16">
      <div class="spinner mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold">Loading Room</h2>
      <p class="text-gray-400">Please wait...</p>
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
          <p class="subtitle">Playing as: {{ nickname }}</p>
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
        
        <div v-if="!playerGrid" class="text-center py-8">
          <p class="text-gray-400">Your bingo board is being prepared...</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'PlayerRoomView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const roomStore = useRoomStore()
    const notificationStore = useNotificationStore()
    
    // Get room ID from route params
    const roomId = route.params.id
    
    // State
    const loading = ref(true)
    const nickname = ref('')
    
    // Computed properties
    const roomData = computed(() => roomStore.currentRoom)
    const isRoomActive = computed(() => roomStore.isRoomActive)
    const gridSize = computed(() => roomData.value?.gridSize || 5)
    
    // Get the player's grid
    const playerGrid = computed(() => {
      if (!roomData.value?.playerGrids || !nickname.value) return null
      return roomData.value.playerGrids[nickname.value] || null
    })
    
    // Check if player has won
    const hasWon = computed(() => {
      if (!roomData.value?.bingoWinners) return false
      return roomData.value.bingoWinners.includes(nickname.value)
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
    
    // Load room data on component mount
    onMounted(async () => {
      loading.value = true
      
      try {
        // Try to get nickname from session storage
        const storedNickname = sessionStorage.getItem(`room_${roomId}_nickname`)
        
        if (storedNickname) {
          nickname.value = storedNickname
          await roomStore.loadRoom(roomId)
        } else {
          // Prompt for nickname if not stored
          const userNickname = prompt('Enter your nickname:')
          
          if (!userNickname) {
            // If user cancels, go back to dashboard
            notificationStore.showNotification('Nickname is required to join a room', 'error')
            router.push('/dashboard')
            return
          }
          
          nickname.value = userNickname
          
          // Join the room with the nickname
          const joinResult = await roomStore.joinRoom(userNickname, roomId)
          
          if (!joinResult) {
            // If joining fails, go back to dashboard
            router.push('/dashboard')
            return
          }
          
          // Save nickname to session storage
          sessionStorage.setItem(`room_${roomId}_nickname`, userNickname)
        }
        
        loading.value = false
      } catch (error) {
        console.error('Error loading room:', error)
        notificationStore.showNotification('Error loading room', 'error')
        router.push('/dashboard')
      }
    })
    
    // Cleanup on component unmount
    onUnmounted(() => {
      roomStore.cleanup()
    })
    
    // Methods
    
    // Mark a cell
    async function markCell(row, col) {
      if (!roomData.value || !isRoomActive.value || !nickname.value) return
      
      // Get the cell
      const cellKey = `${row}_${col}`
      const cell = playerGrid.value?.[cellKey]
      
      if (!cell) return
      
      // Don't allow marking if already marked
      if (cell.marked) {
        notificationStore.showNotification('This cell is already marked', 'info')
        return
      }
      
      // Mark the cell
      await roomStore.markCell(nickname.value, row, col)
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
      nickname,
      roomData,
      isRoomActive,
      gridSize,
      playerGrid,
      hasWon,
      markedCellsCount,
      approvedCellsCount,
      pendingApprovalCount,
      markCell,
      getCellClasses,
      getCellWord,
      getCellState
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
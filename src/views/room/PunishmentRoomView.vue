<template>
  <div class="container py-8">
    <!-- Loading state -->
    <div v-if="loading || !roomData" class="text-center py-16">
      <div class="spinner mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold">Loading Room</h2>
      <p class="text-gray-400">Please wait...</p>
    </div>
    
    <!-- Room management interface -->
    <div v-else>
      <!-- Header section -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="title">Punishment Room: {{ roomData.id }}</h1>
            <span 
              :class="['status-badge', roomData.status === 'active' ? 'bg-success' : 'bg-warning']"
            >
              {{ roomData.status === 'active' ? 'Active' : 'Setup' }}
            </span>
          </div>
          <p class="subtitle">{{ roomData.gridHeight }} rows × 4 columns grid</p>
        </div>
        
        <div class="flex flex-wrap gap-3 mt-4 md:mt-0 items-center">
          <!-- Room Code Display when room is active -->
          <div v-if="isRoomActive" class="flex items-center bg-background-lighter px-3 py-2 rounded mr-3">
            <div class="mr-3">
              <div class="text-xs text-gray-400">Room Code:</div>
              <div class="font-bold text-primary">{{ roomData.id }}</div>
            </div>
            <button 
              @click="copyRoomCode" 
              class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1 px-2"
              title="Copy room code to clipboard"
            >
              Copy
            </button>
          </div>
          
          <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
            Back to Dashboard
          </router-link>
          
          <button 
            v-if="isRoomSetup" 
            @click="startGame" 
            :disabled="Object.keys(roomData.grid || {}).length < requiredCells"
            :class="['btn', Object.keys(roomData.grid || {}).length < requiredCells ? 'bg-gray-600 cursor-not-allowed' : 'btn-primary']"
          >
            Start Game
          </button>
          
          <button 
            v-if="isRoomActive" 
            @click="resetGame" 
            class="btn bg-warning hover:bg-yellow-700 text-white"
          >
            Reset Game
          </button>
        </div>
      </div>
      
      <!-- Game statistics -->
      <div v-if="isRoomActive" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Players</h3>
          <div class="text-2xl font-bold">{{ roomData.players?.length || 0 }}</div>
        </div>
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Called Cells</h3>
          <div class="text-2xl font-bold">{{ roomData.calledOutCells?.length || 0 }}</div>
        </div>
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Completed Punishments</h3>
          <div class="text-2xl font-bold">{{ roomData.completedPunishments?.length || 0 }}</div>
        </div>
      </div>
      
      <!-- Setup Mode Content -->
      <div v-if="isRoomSetup" class="mb-6">
        <div class="card mb-6">
          <h2 class="text-xl font-semibold mb-4">Setup Punishment Bingo</h2>
          <p class="text-sm text-gray-400 mb-4">
            Fill the grid with phrases and punishments. Left side (first two columns) is for the room creator,
            right side (last two columns) is for the players.
          </p>
          
          <div class="mb-4">
            <div class="progress-bar">
              <div 
                class="progress" 
                :style="`width: ${(Object.keys(roomData.grid || {}).length / requiredCells) * 100}%`"
              ></div>
            </div>
            <div class="text-sm text-gray-400 mt-1">
              {{ Object.keys(roomData.grid || {}).length }} / {{ requiredCells }} cells filled
            </div>
          </div>
        </div>
        
        <!-- Grid Setup -->
        <div class="grid-editor">
          <h3 class="text-lg font-semibold mb-3">Edit Grid</h3>
          
          <div class="grid-container">
            <div class="side-label left-label">Room Creator Side</div>
            <div class="side-label right-label">Players Side</div>
            
            <div class="punishment-grid" :style="`grid-template-rows: repeat(${roomData.gridHeight}, 1fr);`">
              <!-- Grid cells -->
              <template v-for="row in roomData.gridHeight" :key="`row-${row}`">
                <template v-for="col in 4" :key="`${row-1}_${col-1}`">
                  <div 
                    :class="['grid-cell', 
                      col <= 2 ? 'creator-side' : 'player-side',
                      cellContent(`${row-1}_${col-1}`) ? 'filled' : ''
                    ]"
                    @click="editCell(row-1, col-1, col <= 2 ? 'left' : 'right')"
                  >
                    <div v-if="cellContent(`${row-1}_${col-1}`)" class="cell-content">
                      <div class="phrase">{{ cellContent(`${row-1}_${col-1}`).phrase }}</div>
                      <div class="punishment">{{ cellContent(`${row-1}_${col-1}`).punishment }}</div>
                      <button @click.stop="removeCell(`${row-1}_${col-1}`)" class="remove-btn">×</button>
                    </div>
                    <div v-else class="empty-cell">
                      <span>Click to add</span>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Active Game Content -->
      <div v-if="isRoomActive">
        <div class="card mb-6">
          <h2 class="text-xl font-semibold mb-4">Punishment Bingo Game</h2>
          
          <div class="grid-container active-mode">
            <div class="side-label left-label">Room Creator Side</div>
            <div class="side-label right-label">Players Side</div>
            
            <div class="punishment-grid" :style="`grid-template-rows: repeat(${roomData.gridHeight}, 1fr);`">
              <!-- Grid cells -->
              <template v-for="row in roomData.gridHeight" :key="`row-${row}`">
                <template v-for="col in 4" :key="`${row-1}_${col-1}`">
                  <div 
                    :class="['grid-cell', 
                      col <= 2 ? 'creator-side' : 'player-side',
                      cellContent(`${row-1}_${col-1}`) ? 'filled' : '',
                      isCellCalled(`${row-1}_${col-1}`) ? 'called' : '',
                      isPunishmentCompleted(`${row-1}_${col-1}`) ? 'completed' : ''
                    ]"
                    @click="handleCellClick(`${row-1}_${col-1}`)"
                  >
                    <div v-if="cellContent(`${row-1}_${col-1}`)" class="cell-content">
                      <div class="phrase">{{ cellContent(`${row-1}_${col-1}`).phrase }}</div>
                      <div class="punishment">{{ cellContent(`${row-1}_${col-1}`).punishment }}</div>
                      
                      <!-- Vote counts -->
                      <div v-if="isCellCalled(`${row-1}_${col-1}`)" class="vote-info">
                        <div class="vote-count">
                          <span class="yes">👍 {{ cellContent(`${row-1}_${col-1}`).votes?.yes || 0 }}</span>
                          <span class="no">👎 {{ cellContent(`${row-1}_${col-1}`).votes?.no || 0 }}</span>
                        </div>
                        
                        <!-- Admin resolve punishment -->
                        <div v-if="!isPunishmentCompleted(`${row-1}_${col-1}`)" class="resolve-buttons">
                          <button 
                            @click.stop="resolvePunishment(`${row-1}_${col-1}`, true)" 
                            class="resolve-btn approve"
                          >
                            ✓
                          </button>
                          <button 
                            @click.stop="resolvePunishment(`${row-1}_${col-1}`, false)" 
                            class="resolve-btn reject"
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
        
        <!-- Players section -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Players</h2>
          <div v-if="!roomData.players || roomData.players.length === 0" class="text-center py-4 text-gray-400">
            No players have joined yet.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div 
              v-for="(player, index) in roomData.players" 
              :key="index"
              class="bg-background-lighter p-3 rounded-lg"
            >
              <span class="font-medium">{{ player.nickname }}</span>
              <div class="text-xs text-gray-400 mt-1">
                Joined: {{ formatTime(player.joinedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cell Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-lg font-semibold">
            {{ editingCellId ? 'Edit Cell' : 'Add New Cell' }}
          </h3>
          <button @click="cancelEdit" class="close-button">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveCell">
            <div class="form-group">
              <label for="phrase">Phrase</label>
              <input 
                type="text" 
                id="phrase" 
                v-model="editingCell.phrase" 
                class="form-control"
                placeholder="Enter bingo phrase" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="punishment">Punishment</label>
              <input 
                type="text" 
                id="punishment" 
                v-model="editingCell.punishment" 
                class="form-control"
                placeholder="Enter punishment" 
                required
              />
            </div>
            
            <div class="text-sm text-gray-400 mb-4">
              Cell position: Row {{ editingCell.position.row + 1 }}, Column {{ editingCell.position.col + 1 }} 
              ({{ editingCell.side === 'left' ? 'Creator' : 'Players' }} side)
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                type="button" 
                @click="cancelEdit" 
                class="btn bg-background-lighter hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePunishmentRoomStore } from '@/stores/punishment-room'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'PunishmentRoomView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const roomStore = usePunishmentRoomStore()
    const notificationStore = useNotificationStore()
    
    // Room ID from route params
    const roomId = route.params.id
    
    // State
    const loading = ref(true)
    const showEditModal = ref(false)
    const editingCellId = ref(null)
    const editingCell = ref({
      phrase: '',
      punishment: '',
      position: { row: 0, col: 0 },
      side: 'left'
    })
    
    // Computed properties
    const roomData = computed(() => roomStore.currentRoom)
    const isRoomSetup = computed(() => roomStore.isRoomSetup)
    const isRoomActive = computed(() => roomStore.isRoomActive)
    const requiredCells = computed(() => roomStore.requiredCells)
    
    // Load room data on component mount
    onMounted(async () => {
      loading.value = true
      
      try {
        await roomStore.loadRoom(roomId)
        loading.value = false
      } catch (error) {
        console.error('Error loading room:', error)
        notificationStore.showNotification('Error loading room', 'error')
        router.push('/dashboard')
      }
    })
    
    // Format timestamp
    function formatTime(timestamp) {
      if (!timestamp) return 'Unknown'
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString()
    }
    
    // Get content for a specific cell
    function cellContent(cellId) {
      return roomData.value?.grid?.[cellId] || null
    }
    
    // Check if a cell is called out
    function isCellCalled(cellId) {
      return roomData.value?.calledOutCells?.includes(cellId) || false
    }
    
    // Check if a punishment is completed
    function isPunishmentCompleted(cellId) {
      return roomData.value?.completedPunishments?.includes(cellId) || false
    }
    
    // Edit a cell
    function editCell(row, col, side) {
      const cellId = `${row}_${col}`
      const existingCell = cellContent(cellId)
      
      if (existingCell) {
        // Edit existing cell
        editingCellId.value = cellId
        editingCell.value = {
          phrase: existingCell.phrase,
          punishment: existingCell.punishment,
          position: existingCell.position,
          side: existingCell.side
        }
      } else {
        // Add new cell
        editingCellId.value = null
        editingCell.value = {
          phrase: '',
          punishment: '',
          position: { row, col },
          side
        }
      }
      
      showEditModal.value = true
    }
    
    // Cancel editing
    function cancelEdit() {
      showEditModal.value = false
      editingCellId.value = null
      editingCell.value = {
        phrase: '',
        punishment: '',
        position: { row: 0, col: 0 },
        side: 'left'
      }
    }
    
    // Save cell
    async function saveCell() {
      const { position, phrase, punishment, side } = editingCell.value
      
      try {
        const result = await roomStore.addCell(position, phrase, punishment, side)
        
        if (result.success) {
          notificationStore.showNotification('Cell saved successfully', 'success')
          showEditModal.value = false
        } else {
          notificationStore.showNotification(result.error, 'error')
        }
      } catch (error) {
        console.error('Error saving cell:', error)
        notificationStore.showNotification('Error saving cell', 'error')
      }
    }
    
    // Remove a cell
    async function removeCell(cellId) {
      if (confirm('Are you sure you want to remove this cell?')) {
        try {
          const result = await roomStore.removeCell(cellId)
          
          if (result.success) {
            notificationStore.showNotification('Cell removed', 'success')
          } else {
            notificationStore.showNotification(result.error, 'error')
          }
        } catch (error) {
          console.error('Error removing cell:', error)
          notificationStore.showNotification('Error removing cell', 'error')
        }
      }
    }
    
    // Start the game
    async function startGame() {
      const cellCount = Object.keys(roomData.value?.grid || {}).length
      
      if (cellCount < requiredCells.value) {
        notificationStore.showNotification(
          `You need ${requiredCells.value} cells to start the game`,
          'warning'
        )
        return
      }
      
      try {
        const result = await roomStore.startGame()
        
        if (result.success) {
          notificationStore.showNotification('Game started successfully!', 'success')
        } else {
          notificationStore.showNotification(result.error, 'error')
        }
      } catch (error) {
        console.error('Error starting game:', error)
        notificationStore.showNotification('Error starting game', 'error')
      }
    }
    
    // Reset the game
    async function resetGame() {
      if (confirm('Are you sure you want to reset the game? This will clear all called cells and votes.')) {
        try {
          const result = await roomStore.resetGame()
          
          if (result.success) {
            notificationStore.showNotification('Game reset to setup mode', 'success')
          } else {
            notificationStore.showNotification(result.error, 'error')
          }
        } catch (error) {
          console.error('Error resetting game:', error)
          notificationStore.showNotification('Error resetting game', 'error')
        }
      }
    }
    
    // Handle cell click in active mode
    async function handleCellClick(cellId) {
      if (!isRoomActive.value) return
      
      if (!isCellCalled(cellId)) {
        // Mark cell as called out
        try {
          const result = await roomStore.markCellCompleted(cellId)
          
          if (result.success) {
            notificationStore.showNotification('Cell marked as completed', 'success')
          } else {
            notificationStore.showNotification(result.error, 'error')
          }
        } catch (error) {
          console.error('Error marking cell:', error)
          notificationStore.showNotification('Error marking cell', 'error')
        }
      }
    }
    
    // Resolve a punishment
    async function resolvePunishment(cellId, completed) {
      try {
        const result = await roomStore.resolvePunishment(cellId, completed)
        
        if (result.success) {
          notificationStore.showNotification('Punishment resolved', 'success')
        } else {
          notificationStore.showNotification(result.error, 'error')
        }
      } catch (error) {
        console.error('Error resolving punishment:', error)
        notificationStore.showNotification('Error resolving punishment', 'error')
      }
    }
    
    // Copy room code to clipboard
    function copyRoomCode() {
      if (!roomData.value?.id) return
      
      navigator.clipboard.writeText(roomData.value.id)
        .then(() => {
          notificationStore.showNotification('Room code copied to clipboard', 'success')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
          notificationStore.showNotification('Failed to copy room code', 'error')
        })
    }
    
    // Cleanup on component unmount
    onUnmounted(() => {
      roomStore.cleanup()
    })
    
    return {
      loading,
      roomData,
      roomId,
      isRoomSetup,
      isRoomActive,
      requiredCells,
      showEditModal,
      editingCellId,
      editingCell,
      formatTime,
      cellContent,
      isCellCalled,
      isPunishmentCompleted,
      editCell,
      cancelEdit,
      saveCell,
      removeCell,
      startGame,
      resetGame,
      handleCellClick,
      resolvePunishment,
      copyRoomCode
    }
  }
}
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}

.progress-bar {
  height: 8px;
  background-color: theme('colors.background.lighter');
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #FF4081;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Grid Layout */
.grid-container {
  @apply relative my-6;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "labels labels" "grid grid";
}

.side-label {
  @apply py-2 text-center font-semibold text-sm;
}

.left-label {
  grid-area: left-label;
  @apply bg-blue-500 bg-opacity-20 rounded-t-lg;
}

.right-label {
  grid-area: right-label;
  @apply bg-green-500 bg-opacity-20 rounded-t-lg;
}

.punishment-grid {
  grid-area: grid;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 8px;
  @apply p-4 bg-background-card rounded-lg;
}

.grid-cell {
  aspect-ratio: 1;
  min-height: 120px;
  @apply bg-background-lighter rounded p-2 relative cursor-pointer transition-colors;
}

.creator-side {
  @apply bg-blue-900 bg-opacity-10 hover:bg-blue-900 hover:bg-opacity-20;
}

.player-side {
  @apply bg-green-900 bg-opacity-10 hover:bg-green-900 hover:bg-opacity-20;
}

.grid-cell.filled {
  @apply cursor-default;
}

.grid-cell.called {
  @apply border-2;
}

.grid-cell.called.creator-side {
  @apply border-blue-500;
}

.grid-cell.called.player-side {
  @apply border-green-500;
}

.grid-cell.completed {
  @apply opacity-50;
}

.cell-content {
  @apply h-full flex flex-col justify-between;
}

.phrase {
  @apply font-medium text-sm mb-2;
}

.punishment {
  @apply text-xs italic text-gray-400;
}

.empty-cell {
  @apply h-full flex items-center justify-center text-xs text-gray-500;
}

.remove-btn {
  @apply absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-error text-white opacity-0 transition-opacity;
}

.grid-cell:hover .remove-btn {
  @apply opacity-100;
}

.vote-info {
  @apply mt-2 flex items-center justify-between text-xs;
}

.vote-count {
  @apply flex gap-2;
}

.yes {
  @apply text-green-400;
}

.no {
  @apply text-red-400;
}

.resolve-buttons {
  @apply flex gap-1;
}

.resolve-btn {
  @apply w-5 h-5 rounded-full flex items-center justify-center text-xs;
}

.resolve-btn.approve {
  @apply bg-success text-white;
}

.resolve-btn.reject {
  @apply bg-error text-white;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-container {
  @apply bg-background-card rounded-lg shadow-lg w-full max-w-md;
}

.modal-header {
  @apply flex justify-between items-center p-4 border-b border-gray-700;
}

.modal-body {
  @apply p-4;
}

.close-button {
  @apply text-2xl text-gray-400 hover:text-white;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-300 mb-1;
}
</style>

<template>
  <div class="container py-8">
    <!-- Loading state -->
    <div v-if="loading || !roomData" class="text-center py-16">
      <div class="spinner mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold">Loading Room</h2>
      <p class="text-gray-400">Please wait...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="text-center py-16">
      <div class="text-error mb-4 text-5xl">⚠️</div>
      <h2 class="text-xl font-semibold mb-2">Error Loading Game</h2>
      <p class="text-gray-400 mb-6">{{ error }}</p>
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
      <p class="text-gray-400 mb-8">The host is setting up the game. Please wait.</p>
      
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
            <h1 class="title">Punishment Bingo: {{ roomId }}</h1>
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
        <h2 class="text-xl font-semibold mb-4">How to Play</h2>
        <p class="mb-4">
          In this game, watch for events described in the cells. When an event happens, the cell gets marked.
          Each cell contains a phrase and a punishment - the punishment must be performed by whoever's side the cell is on.
        </p>
        <ul class="list-disc list-inside mb-4 space-y-2">
          <li>Left side (blue): Punishments for the host</li>
          <li>Right side (green): Punishments for the players</li>
          <li>When a cell is called out, vote if the punishment was completed</li>
        </ul>
      </div>
      
      <!-- Game Grid -->
      <div class="card mb-6">
        <div class="grid-container active-mode">
          <div class="grid-header">
            <div class="side-label left-label">Host Side</div>
            <div class="side-label right-label">Players Side</div>
          </div>
          
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
                >
                  <div v-if="cellContent(`${row-1}_${col-1}`)" class="cell-content">
                    <div class="phrase">{{ cellContent(`${row-1}_${col-1}`).phrase }}</div>
                    <div class="punishment">{{ cellContent(`${row-1}_${col-1}`).punishment }}</div>
                    
                    <!-- Voting UI -->
                    <PunishmentVotingUI
                      v-if="isCellCalled(`${row-1}_${col-1}`) && !isPunishmentCompleted(`${row-1}_${col-1}`)"
                      :votes="cellContent(`${row-1}_${col-1}`).votes || { yes: 0, no: 0 }"
                      :user-voted="getUserVote(`${row-1}_${col-1}`)"
                      @vote="(vote) => votePunishment(`${row-1}_${col-1}`, vote)"
                    />
                    
                    <!-- Completed indicator -->
                    <div v-if="isPunishmentCompleted(`${row-1}_${col-1}`)" class="completed-indicator">
                      ✓ Punishment completed
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
            :class="['bg-background-lighter p-3 rounded-lg', player.nickname === username ? 'border-2 border-primary' : '']"
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePunishmentRoomStore } from '@/stores/punishment-room'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import PunishmentVotingUI from '@/components/punishment/PunishmentVotingUI.vue'

// Set up hooks
const route = useRoute()
const router = useRouter()
const roomStore = usePunishmentRoomStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// Get room ID from route params
const roomId = route.params.id

// State
const loading = ref(true)
const error = ref(null)

// Computed properties
const roomData = computed(() => roomStore.currentRoom)
const isRoomActive = computed(() => roomStore.isRoomActive)
const username = computed(() => authStore.username)

// Load room data on component mount
onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    // Check authentication
    if (!authStore.username) {
      notificationStore.showNotification('You must be logged in to join a room', 'error')
      router.push('/dashboard')
      return
    }
    
    // Load room data and join the room
    await loadRoomAndJoin()
    
    loading.value = false
  } catch (err) {
    console.error('Error during initial load:', err)
    error.value = err.message || 'Error loading room'
    loading.value = false
  }
})

// Watch for room status changes
watch(() => roomData.value?.status, (newStatus) => {
  console.log(`Room status changed to: ${newStatus}`)
})

// Load room data and join as player
async function loadRoomAndJoin() {
  try {
    // First, load the room to check if it exists
    await roomStore.loadRoom(roomId)
    
    if (!roomData.value) {
      throw new Error(`Room ${roomId} not found`)
    }
    
    console.log(`Room loaded, status: ${roomData.value.status}`)
    
    // Now join the room with the current username
    const joinResult = await roomStore.joinRoom(username.value, roomId)
    
    if (!joinResult || !joinResult.success) {
      throw new Error('Failed to join the room. Please try again.')
    }
    
    console.log('Successfully joined room')
    
    return true
  } catch (err) {
    console.error('Error in loadRoomAndJoin:', err)
    error.value = err.message || 'Failed to load room data'
    return false
  }
}

// Retry loading room
async function retryLoading() {
  loading.value = true
  error.value = null
  
  try {
    await loadRoomAndJoin()
    loading.value = false
  } catch (err) {
    console.error('Error in retryLoading:', err)
    error.value = err.message || 'Error reloading room'
    loading.value = false
  }
}

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

// Get user's vote for a particular cell
function getUserVote(cellId) {
  const voteKey = `${cellId}_${username.value}`
  return roomData.value?.punishmentVotes?.[voteKey] || null
}

// Vote on a punishment
async function votePunishment(cellId, vote) {
  try {
    const result = await roomStore.votePunishment(cellId, username.value, vote)
    
    if (result.success) {
      notificationStore.showNotification('Vote submitted', 'success')
    } else {
      notificationStore.showNotification(result.error, 'error')
    }
  } catch (err) {
    console.error('Error voting on punishment:', err)
    notificationStore.showNotification('Error submitting vote', 'error')
  }
}

// Cleanup on component unmount
onUnmounted(() => {
  roomStore.cleanup()
})
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}

/* Grid Layout */
.grid-container {
  @apply relative my-6;
}

.grid-header {
  @apply flex mb-0;
}

.side-label {
  @apply py-2 text-center font-semibold text-sm flex-1;
}

.left-label {
  @apply bg-blue-500 bg-opacity-20 rounded-t-lg;
}

.right-label {
  @apply bg-green-500 bg-opacity-20 rounded-t-lg;
}

.punishment-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 8px;
  @apply p-4 bg-background-card rounded-lg;
}

.grid-cell {
  aspect-ratio: 1;
  min-height: 120px;
  @apply bg-background-lighter rounded p-2 relative transition-colors;
}

.creator-side {
  @apply bg-blue-900 bg-opacity-10;
}

.player-side {
  @apply bg-green-900 bg-opacity-10;
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
  font-size: 0.85rem;
}

.phrase {
  @apply font-medium mb-1;
}

.punishment {
  @apply text-xs italic text-gray-400;
}

.completed-indicator {
  @apply mt-2 text-xs text-center text-success;
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

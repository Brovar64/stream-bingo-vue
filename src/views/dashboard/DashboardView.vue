<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="title">Dashboard</h1>
      <div class="flex space-x-4">
        <router-link to="/word-sets" class="btn bg-primary hover:bg-primary-dark text-white">
          Manage Word Sets
        </router-link>
        <button @click="logout" class="btn bg-background-lighter hover:bg-gray-700 text-white">
          Logout
        </button>
      </div>
    </div>
    
    <!-- User info banner -->
    <div class="bg-background-lighter p-4 rounded-lg mb-6 flex justify-between items-center">
      <div>
        <span class="text-gray-400">Logged in as:</span> 
        <span class="font-semibold ml-1">{{ username }}</span>
      </div>
      <button 
        v-if="isTestUser"
        @click="openLoginTab" 
        class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1 px-3"
      >
        Open New Login Tab
      </button>
    </div>
    
    <!-- Create Rooms Section -->
    <div class="mb-10">
      <h2 class="text-xl font-semibold mb-4">Create a New Room</h2>
      
      <!-- Game Mode Selector Tabs -->
      <div class="game-mode-tabs mb-6">
        <button 
          @click="gameMode = 'classic'" 
          :class="['tab-button', gameMode === 'classic' ? 'active' : '']"
        >
          Classic Bingo
        </button>
        <button 
          @click="gameMode = 'punishment'" 
          :class="['tab-button', gameMode === 'punishment' ? 'active' : '']"
        >
          Punishment Bingo
        </button>
      </div>
      
      <!-- Cards Grid - 2 columns with mode description card -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Classic Bingo Create Form -->
        <div v-if="gameMode === 'classic'" class="card">
          <h3 class="text-lg font-semibold mb-2">Classic Bingo</h3>
          <p class="text-sm text-gray-400 mb-4">
            Each player gets a unique randomized bingo board. Players mark cells when events happen.
          </p>
          
          <form @submit.prevent="createClassicRoom" class="space-y-4">
            <div class="form-group">
              <label for="roomCode">Room Code</label>
              <div class="flex">
                <input 
                  type="text" 
                  id="roomCode" 
                  v-model="newRoom.code"
                  class="form-control"
                  placeholder="Enter 4-6 character code"
                  maxlength="6"
                  required
                  autocomplete="off"
                >
                <button 
                  type="button"
                  @click="generateRandomCode"
                  class="ml-2 bg-background-lighter p-2 rounded hover:bg-gray-700"
                  title="Generate random code"
                >
                  🎲
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label for="gridSize">Grid Size</label>
              <select id="gridSize" v-model="newRoom.gridSize" class="form-control">
                <option value="3">3x3 (Small)</option>
                <option value="4">4x4 (Medium)</option>
                <option value="5">5x5 (Standard)</option>
              </select>
            </div>
            
            <div class="form-group" v-if="wordSets.length > 0">
              <label for="wordSet">Word Set (Optional)</label>
              <select id="wordSet" v-model="newRoom.wordSetId" class="form-control">
                <option value="">None (Add words manually)</option>
                <option v-for="set in wordSets" :key="set.id" :value="set.id">
                  {{ set.name }} ({{ set.words.length }} words)
                </option>
              </select>
              <p class="text-xs text-gray-400 mt-1">
                Select a word set to automatically populate your bingo room with those words
              </p>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary w-full"
              :disabled="loading"
            >
              {{ loading ? 'Creating...' : 'Create Classic Room' }}
            </button>
          </form>
        </div>
        
        <!-- Punishment Bingo Create Form -->
        <div v-if="gameMode === 'punishment'" class="card">
          <h3 class="text-lg font-semibold mb-2">Punishment Bingo</h3>
          <p class="text-sm text-gray-400 mb-4">
            A shared grid with punishments. Left half for host, right half for players. Vote on punishments.
          </p>
          
          <form @submit.prevent="createPunishmentRoom" class="space-y-4">
            <div class="form-group">
              <label for="punishmentRoomCode">Room Code</label>
              <div class="flex">
                <input 
                  type="text" 
                  id="punishmentRoomCode" 
                  v-model="punishmentRoom.code"
                  class="form-control"
                  placeholder="Enter 4-6 character code"
                  maxlength="6"
                  required
                  autocomplete="off"
                >
                <button 
                  type="button"
                  @click="generateRandomPunishmentCode"
                  class="ml-2 bg-background-lighter p-2 rounded hover:bg-gray-700"
                  title="Generate random code"
                >
                  🎲
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label for="gridHeight">Grid Height</label>
              <select id="gridHeight" v-model="punishmentRoom.gridHeight" class="form-control">
                <option value="3">3 rows (4x3 grid)</option>
                <option value="4">4 rows (4x4 grid)</option>
                <option value="5">5 rows (4x5 grid)</option>
              </select>
              <p class="text-xs text-gray-400 mt-1">
                Width is fixed at 4 columns (2 for host, 2 for players)
              </p>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary w-full"
              :disabled="loading"
            >
              {{ loading ? 'Creating...' : 'Create Punishment Room' }}
            </button>
          </form>
        </div>
        
        <!-- Join Room Card -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-2">Join Existing Room</h3>
          <p class="text-sm text-gray-400 mb-4">
            Enter a room code to join a game as a player. Works for both Classic and Punishment games.
          </p>
          
          <form @submit.prevent="handleJoinRoom" class="space-y-4">
            <div class="form-group">
              <label for="joinRoomCode">Room Code</label>
              <input 
                type="text" 
                id="joinRoomCode" 
                v-model="joinRoomData.code"
                class="form-control"
                placeholder="Enter room code"
                maxlength="6"
                required
                autocomplete="off"
              >
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary w-full"
              :disabled="joinLoading"
              ref="joinButton"
            >
              {{ joinLoading ? 'Joining...' : 'Join Room' }}
            </button>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Your Rooms Section -->
    <div class="mt-12">
      <h2 class="text-xl font-semibold mb-4">Your Created Rooms</h2>
      
      <div v-if="loading" class="text-center py-8">
        <div class="spinner mx-auto mb-4"></div>
        <p>Loading your rooms...</p>
      </div>
      
      <!-- Room Type Tabs -->
      <div class="game-mode-tabs mb-4">
        <button 
          @click="roomListTab = 'classic'" 
          :class="['tab-button', roomListTab === 'classic' ? 'active' : '']"
        >
          Classic Rooms
        </button>
        <button 
          @click="roomListTab = 'punishment'" 
          :class="['tab-button', roomListTab === 'punishment' ? 'active' : '']"
        >
          Punishment Rooms
        </button>
      </div>
      
      <!-- Classic Rooms List -->
      <div v-if="roomListTab === 'classic'">
        <div v-if="userRooms.length === 0" class="text-center py-8 text-gray-400">
          <p>You haven't created any classic bingo rooms yet.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="room in userRooms" :key="room.id" class="bg-background-lighter p-4 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold">{{ room.id }}</h3>
                <div class="flex items-center mt-1">
                  <span 
                    :class="['status-badge', room.status === 'active' ? 'bg-success' : 'bg-warning']"
                  >
                    {{ room.status === 'active' ? 'Active' : 'Setup' }}
                  </span>
                  <span class="ml-2 text-sm text-gray-400">
                    {{ room.gridSize }}x{{ room.gridSize }}
                  </span>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  @click="navigateToRoom(room.id)"
                  class="btn btn-primary py-1 px-2 text-sm"
                >
                  Manage
                </button>
                <button 
                  @click="confirmDeleteRoom(room.id)"
                  class="btn bg-error hover:bg-red-700 py-1 px-2 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <!-- Quick join for testing -->
            <div v-if="room.status === 'active' && isTestUser" class="mt-2 flex justify-end">
              <button 
                @click="handleQuickJoinRoom(room.id)"
                class="text-primary hover:text-primary-light text-sm"
              >
                Join as player
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Punishment Rooms List -->
      <div v-if="roomListTab === 'punishment'">
        <div v-if="userPunishmentRooms.length === 0" class="text-center py-8 text-gray-400">
          <p>You haven't created any punishment bingo rooms yet.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="room in userPunishmentRooms" :key="room.id" class="bg-background-lighter p-4 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold">{{ room.id }}</h3>
                <div class="flex items-center mt-1">
                  <span 
                    :class="['status-badge', room.status === 'active' ? 'bg-success' : 'bg-warning']"
                  >
                    {{ room.status === 'active' ? 'Active' : 'Setup' }}
                  </span>
                  <span class="ml-2 text-sm text-gray-400">
                    4x{{ room.gridHeight }}
                  </span>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  @click="navigateToPunishmentRoom(room.id)"
                  class="btn btn-primary py-1 px-2 text-sm"
                >
                  Manage
                </button>
                <button 
                  @click="confirmDeletePunishmentRoom(room.id)"
                  class="btn bg-error hover:bg-red-700 py-1 px-2 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <!-- Quick join for testing -->
            <div v-if="room.status === 'active' && isTestUser" class="mt-2 flex justify-end">
              <button 
                @click="handleQuickJoinPunishmentRoom(room.id)"
                class="text-primary hover:text-primary-light text-sm"
              >
                Join as player
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Rooms section for all users (primarily for testing) -->
    <div v-if="isTestUser && (allActiveRooms.length > 0 || allActivePunishmentRooms.length > 0)" class="mt-12">
      <h2 class="text-xl font-semibold mb-4">All Active Rooms</h2>
      
      <!-- Room Type Tabs -->
      <div class="game-mode-tabs mb-4">
        <button 
          @click="activeRoomsTab = 'classic'" 
          :class="['tab-button', activeRoomsTab === 'classic' ? 'active' : '']"
        >
          Classic Rooms
        </button>
        <button 
          @click="activeRoomsTab = 'punishment'" 
          :class="['tab-button', activeRoomsTab === 'punishment' ? 'active' : '']"
        >
          Punishment Rooms
        </button>
      </div>
      
      <!-- Classic Active Rooms -->
      <div v-if="activeRoomsTab === 'classic'">
        <div v-if="allActiveRooms.length === 0" class="text-center py-8 text-gray-400">
          <p>No active classic bingo rooms found.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="room in allActiveRooms" 
            :key="room.id"
            class="bg-background-lighter p-4 rounded-lg"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold">{{ room.id }}</h3>
                <p class="text-sm text-gray-400">{{ room.gridSize }}x{{ room.gridSize }}</p>
              </div>
              <button 
                @click="handleQuickJoinRoom(room.id)"
                class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1 px-3"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Punishment Active Rooms -->
      <div v-if="activeRoomsTab === 'punishment'">
        <div v-if="allActivePunishmentRooms.length === 0" class="text-center py-8 text-gray-400">
          <p>No active punishment bingo rooms found.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="room in allActivePunishmentRooms" 
            :key="room.id"
            class="bg-background-lighter p-4 rounded-lg"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold">{{ room.id }}</h3>
                <p class="text-sm text-gray-400">4x{{ room.gridHeight }}</p>
              </div>
              <button 
                @click="handleQuickJoinPunishmentRoom(room.id)"
                class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1 px-3"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoomStore } from '@/stores/room'
import { useVueFireRoomStore } from '@/stores/vuefire-room'
import { usePunishmentRoomStore } from '@/stores/punishment-room'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const roomStore = useRoomStore()
    const vuefireRoomStore = useVueFireRoomStore()
    const punishmentRoomStore = usePunishmentRoomStore()
    const notificationStore = useNotificationStore()
    
    // Refs
    const joinButton = ref(null)
    
    // State
    const loading = ref(false)
    const joinLoading = ref(false)
    const gameMode = ref('classic') // 'classic' or 'punishment'
    const roomListTab = ref('classic') // 'classic' or 'punishment'
    const activeRoomsTab = ref('classic') // 'classic' or 'punishment'
    
    // Classic Bingo state
    const newRoom = ref({
      code: '',
      gridSize: 3, // Set default to 3x3
      wordSetId: ''
    })
    
    // Punishment Bingo state
    const punishmentRoom = ref({
      code: '',
      gridHeight: 3, // Set default to 4x3
    })
    
    const joinRoomData = ref({
      code: ''
    })
    
    const userRooms = ref([])
    const userPunishmentRooms = ref([])
    const allActiveRooms = ref([])
    const allActivePunishmentRooms = ref([])
    const wordSets = ref([])
    
    // Computed properties
    const username = computed(() => authStore.username)
    const isTestUser = computed(() => {
      return authStore.user?.authMethod === 'test'
    })
    
    // Load user's rooms on component mount
    onMounted(async () => {
      loading.value = true
      
      // Load user's rooms
      userRooms.value = await roomStore.loadUserRooms()
      
      // Load user's punishment rooms
      try {
        // Note: This would need to be implemented in the punishment-room store
        userPunishmentRooms.value = [] // await punishmentRoomStore.loadUserRooms()
      } catch (error) {
        console.error('Failed to load punishment rooms:', error)
      }
      
      // Load all active rooms (for testing)
      if (isTestUser.value) {
        allActiveRooms.value = await roomStore.loadActiveRooms()
        // Note: This would need to be implemented in the punishment-room store
        allActivePunishmentRooms.value = [] // await punishmentRoomStore.loadActiveRooms()
      }
      
      // Load saved word sets
      loadWordSets()
      
      loading.value = false
    })
    
    // Methods
    
    // Load word sets from local storage
    function loadWordSets() {
      const storedSets = localStorage.getItem('bingoWordSets')
      if (storedSets) {
        try {
          const parsedSets = JSON.parse(storedSets)
          // Add an id property to each set based on its index
          wordSets.value = parsedSets.map((set, index) => ({
            ...set,
            id: index
          }))
        } catch (error) {
          console.error('Failed to parse word sets:', error)
          wordSets.value = []
        }
      }
    }
    
    // Generate a random room code
    function generateRandomCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      newRoom.value.code = code
    }
    
    // Generate a random punishment room code
    function generateRandomPunishmentCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      punishmentRoom.value.code = code
    }
    
    // Create a new classic room
    async function createClassicRoom() {
      loading.value = true
      
      try {
        // Check if we need to use a word set
        let words = []
        if (newRoom.value.wordSetId !== '') {
          const setIndex = parseInt(newRoom.value.wordSetId)
          if (!isNaN(setIndex) && wordSets.value[setIndex]) {
            words = [...wordSets.value[setIndex].words]
          }
        }
        
        const roomId = await roomStore.createRoom(
          newRoom.value.code,
          parseInt(newRoom.value.gridSize),
          words
        )
        
        if (roomId) {
          // Navigate to the admin room page
          router.push(`/admin/room/${roomId}`)
        }
      } catch (error) {
        console.error('Create room error:', error)
        notificationStore.showNotification('Failed to create room', 'error')
      } finally {
        loading.value = false
      }
    }
    
    // Create a new punishment room
    async function createPunishmentRoom() {
      loading.value = true
      
      try {
        const result = await punishmentRoomStore.createRoom(
          parseInt(punishmentRoom.value.gridHeight)
        )
        
        if (result && result.success) {
          // Add the room to the list
          userPunishmentRooms.value.push({
            id: result.roomId,
            status: 'setup',
            gridHeight: parseInt(punishmentRoom.value.gridHeight)
          })
          
          // Navigate to the punishment room page
          router.push(`/punishment/${result.roomId}`)
        } else {
          notificationStore.showNotification('Failed to create punishment room', 'error')
        }
      } catch (error) {
        console.error('Create punishment room error:', error)
        notificationStore.showNotification('Failed to create punishment room', 'error')
      } finally {
        loading.value = false
      }
    }
    
    // Join room using VueFire only
    async function handleJoinRoom() {
      // Prevent action if already loading
      if (joinLoading.value) {
        return
      }
      
      // Disable the button to prevent double clicks
      joinLoading.value = true
      
      try {
        // Get and normalize the room code
        const roomCode = joinRoomData.value.code.trim().toUpperCase()
        joinRoomData.value.code = roomCode
        
        if (!roomCode) {
          notificationStore.showNotification('Please enter a room code', 'error')
          joinLoading.value = false
          return
        }
        
        // Try joining as a classic game first
        try {
          const result = await vuefireRoomStore.joinRoom(username.value, roomCode)
          
          if (result && result.success) {
            router.push(`/play-new/${roomCode}`)
            return
          }
        } catch (error) {
          console.log('Not a classic room, trying punishment room...')
        }
        
        // If that fails, try joining as a punishment game
        try {
          const result = await punishmentRoomStore.joinRoom(username.value, roomCode)
          
          if (result && result.success) {
            router.push(`/punishment-play/${roomCode}`)
            return
          }
        } catch (error) {
          console.error('Failed to join punishment room:', error)
          notificationStore.showNotification('Room not found or cannot be joined', 'error')
        }
        
        joinLoading.value = false
      } catch (error) {
        console.error('Join room error:', error)
        notificationStore.showNotification(`Failed to join room: ${error.message}`, 'error')
        joinLoading.value = false
      }
    }
    
    // Quick join a classic room
    async function handleQuickJoinRoom(roomId) {
      if (joinLoading.value) return
      
      joinLoading.value = true
      
      try {
        // Always use VueFire
        await vuefireRoomStore.joinRoom(username.value, roomId)
        router.push(`/play-new/${roomId}`)
      } catch (error) {
        console.error(`Error joining room: ${error}`)
        notificationStore.showNotification(`Failed to join room: ${error.message || 'Unknown error'}`, 'error')
        joinLoading.value = false
      }
    }
    
    // Quick join a punishment room
    async function handleQuickJoinPunishmentRoom(roomId) {
      if (joinLoading.value) return
      
      joinLoading.value = true
      
      try {
        await punishmentRoomStore.joinRoom(username.value, roomId)
        router.push(`/punishment-play/${roomId}`)
      } catch (error) {
        console.error(`Error joining punishment room: ${error}`)
        notificationStore.showNotification(`Failed to join room: ${error.message || 'Unknown error'}`, 'error')
        joinLoading.value = false
      }
    }
    
    // Open a new login tab
    function openLoginTab() {
      window.open('/login', '_blank')
    }
    
    // Navigate to room management
    function navigateToRoom(roomId) {
      router.push(`/admin/room/${roomId}`)
    }
    
    // Navigate to punishment room management
    function navigateToPunishmentRoom(roomId) {
      router.push(`/punishment/${roomId}`)
    }
    
    // Delete room with confirmation
    function confirmDeleteRoom(roomId) {
      if (confirm(`Are you sure you want to delete room ${roomId}? This cannot be undone.`)) {
        deleteRoom(roomId)
      }
    }
    
    // Delete a classic room
    async function deleteRoom(roomId) {
      loading.value = true
      
      try {
        const success = await roomStore.deleteRoom(roomId)
        
        if (success) {
          // Refresh the rooms list
          userRooms.value = await roomStore.loadUserRooms()
          
          // Also refresh active rooms list if we're in test mode
          if (isTestUser.value) {
            allActiveRooms.value = await roomStore.loadActiveRooms()
          }
        }
      } catch (error) {
        console.error('Delete room error:', error)
        notificationStore.showNotification('Failed to delete room', 'error')
      } finally {
        loading.value = false
      }
    }
    
    // Delete punishment room with confirmation
    function confirmDeletePunishmentRoom(roomId) {
      if (confirm(`Are you sure you want to delete punishment room ${roomId}? This cannot be undone.`)) {
        deletePunishmentRoom(roomId)
      }
    }
    
    // Delete a punishment room
    async function deletePunishmentRoom(roomId) {
      loading.value = true
      
      try {
        // Note: This would need to be implemented in the punishment-room store
        // const success = await punishmentRoomStore.deleteRoom(roomId)
        
        // For now, just remove it from the local list
        userPunishmentRooms.value = userPunishmentRooms.value.filter(room => room.id !== roomId)
        
        notificationStore.showNotification('Room deleted', 'success')
      } catch (error) {
        console.error('Delete punishment room error:', error)
        notificationStore.showNotification('Failed to delete punishment room', 'error')
      } finally {
        loading.value = false
      }
    }
    
    // Logout
    function logout() {
      authStore.logout()
      router.push('/')
    }
    
    return {
      loading,
      joinLoading,
      gameMode,
      roomListTab,
      activeRoomsTab,
      newRoom,
      punishmentRoom,
      joinRoomData,
      userRooms,
      userPunishmentRooms,
      allActiveRooms,
      allActivePunishmentRooms,
      wordSets,
      username,
      isTestUser,
      joinButton,
      generateRandomCode,
      generateRandomPunishmentCode,
      createClassicRoom,
      createPunishmentRoom,
      handleJoinRoom,
      handleQuickJoinRoom,
      handleQuickJoinPunishmentRoom,
      openLoginTab,
      navigateToRoom,
      navigateToPunishmentRoom,
      confirmDeleteRoom,
      confirmDeletePunishmentRoom,
      logout
    }
  }
}
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}

.game-mode-tabs {
  @apply flex space-x-2 mb-4;
}

.tab-button {
  @apply px-4 py-2 rounded-lg bg-background-lighter hover:bg-gray-700 transition-colors;
}

.tab-button.active {
  @apply bg-primary text-white;
}
</style>
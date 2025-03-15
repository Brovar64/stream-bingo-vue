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
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Create Room Card -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Create a Bingo Room</h2>
        <form @submit.prevent="createRoom" class="space-y-4">
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
            {{ loading ? 'Creating...' : 'Create Room' }}
          </button>
        </form>
      </div>
      
      <!-- Join Room Card -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Join Existing Room</h2>
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
      
      <!-- Your Rooms Card -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Your Created Rooms</h2>
        
        <div v-if="loading" class="text-center py-8">
          <div class="spinner mx-auto mb-4"></div>
          <p>Loading your rooms...</p>
        </div>
        
        <div v-else-if="userRooms.length === 0" class="text-center py-8 text-gray-400">
          <p>You haven't created any rooms yet.</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="room in userRooms" :key="room.id" class="bg-background-lighter p-4 rounded-lg">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">Room: {{ room.id }}</h3>
                <p class="text-sm text-gray-400">{{ room.gridSize }}x{{ room.gridSize }} grid</p>
                <div class="flex items-center mt-1">
                  <span 
                    :class="['status-badge', room.status === 'active' ? 'bg-success' : 'bg-warning']"
                  >
                    {{ room.status === 'active' ? 'Active' : 'Setup' }}
                  </span>
                  <span class="ml-2 text-sm text-gray-400">
                    {{ room.players?.length || 0 }} players
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
            
            <!-- Quick join section for active rooms -->
            <div v-if="room.status === 'active' && isTestUser" class="mt-3 pt-3 border-t border-gray-700">
              <div class="flex items-center">
                <button 
                  @click="copyRoomCodeForTesting(room.id)"
                  class="text-primary hover:text-primary-light text-sm flex items-center"
                >
                  <span class="mr-1">📋</span> Copy room code for testing
                </button>
                <button 
                  v-if="username !== 'Admin'"
                  @click="handleQuickJoinRoom(room.id)"
                  class="ml-auto btn bg-success text-white text-xs py-1 px-2"
                >
                  Quick Join as {{ username }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Rooms section for all users (primarily for testing) -->
    <div v-if="allActiveRooms.length > 0" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">All Active Rooms</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="room in allActiveRooms" 
          :key="room.id"
          class="bg-background-lighter p-4 rounded-lg"
        >
          <div class="flex justify-between">
            <div>
              <h3 class="font-semibold">Room: {{ room.id }}</h3>
              <p class="text-sm text-gray-400">{{ room.gridSize }}x{{ room.gridSize }} grid</p>
              <p class="text-sm text-gray-400">{{ room.players?.length || 0 }} players</p>
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
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoomStore } from '@/stores/room'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const roomStore = useRoomStore()
    const notificationStore = useNotificationStore()
    
    // Refs
    const joinButton = ref(null)
    
    // State
    const loading = ref(false)
    const joinLoading = ref(false)
    const newRoom = ref({
      code: '',
      gridSize: 5,
      wordSetId: ''
    })
    const joinRoomData = ref({
      code: ''
    })
    const userRooms = ref([])
    const allActiveRooms = ref([])
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
      
      // Load all active rooms (for testing)
      if (isTestUser.value) {
        allActiveRooms.value = await roomStore.loadActiveRooms()
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
    
    // Create a new room
    async function createRoom() {
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
    
    // Join room from the form
    async function handleJoinRoom() {
      console.log("[DASHBOARD] handleJoinRoom called")
      
      // Prevent action if already loading
      if (joinLoading.value) {
        console.log("[DASHBOARD] Join already in progress, ignoring")
        return
      }
      
      // Disable the button to prevent double clicks
      joinLoading.value = true
      console.log("[DASHBOARD] Set joinLoading to true")
      
      try {
        // Get and normalize the room code
        const roomCode = joinRoomData.value.code.trim().toUpperCase()
        joinRoomData.value.code = roomCode
        console.log(`[DASHBOARD] Joining room: ${roomCode}`)
        
        if (!roomCode) {
          notificationStore.showNotification('Please enter a room code', 'error')
          joinLoading.value = false
          console.log("[DASHBOARD] No room code provided")
          return
        }
        
        // Try to join the room - we don't care about the return value
        try {
          await roomStore.joinRoom(username.value, roomCode)
          console.log(`[DASHBOARD] Join complete, navigating to room: ${roomCode}`)
          router.push(`/play/${roomCode}`)
        } catch (error) {
          console.error('[DASHBOARD] Join failed:', error)
          notificationStore.showNotification(`Failed to join room: ${error.message || 'Unknown error'}`, 'error')
          joinLoading.value = false
        }
      } catch (error) {
        console.error('[DASHBOARD] Join room error:', error)
        notificationStore.showNotification(`Failed to join room: ${error.message}`, 'error')
        joinLoading.value = false
      }
    }
    
    // Ultra-simplified quick join room handler
    async function handleQuickJoinRoom(roomId) {
      console.log(`[DASHBOARD] Joining room: ${roomId}`)
      
      if (joinLoading.value) return
      
      joinLoading.value = true
      
      try {
        // Just call join and immediately navigate, no results checking
        await roomStore.joinRoom(username.value, roomId)
        router.push(`/play/${roomId}`)
      } catch (error) {
        console.error(`[DASHBOARD] Error joining room: ${error}`)
        notificationStore.showNotification(`Failed to join room: ${error.message || 'Unknown error'}`, 'error')
        joinLoading.value = false
      }
    }
    
    // Copy room code for testing
    function copyRoomCodeForTesting(roomId) {
      navigator.clipboard.writeText(roomId)
        .then(() => {
          notificationStore.showNotification('Room code copied to clipboard', 'success')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
          notificationStore.showNotification('Failed to copy room code', 'error')
        })
    }
    
    // Open a new login tab
    function openLoginTab() {
      window.open('/login', '_blank')
    }
    
    // Navigate to room management
    function navigateToRoom(roomId) {
      router.push(`/admin/room/${roomId}`)
    }
    
    // Delete room with confirmation
    function confirmDeleteRoom(roomId) {
      if (confirm(`Are you sure you want to delete room ${roomId}? This cannot be undone.`)) {
        deleteRoom(roomId)
      }
    }
    
    // Delete a room
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
    
    // Logout
    function logout() {
      authStore.logout()
      router.push('/')
    }
    
    return {
      loading,
      joinLoading,
      newRoom,
      joinRoomData,
      userRooms,
      allActiveRooms,
      wordSets,
      username,
      isTestUser,
      joinButton,
      generateRandomCode,
      createRoom,
      handleJoinRoom,
      handleQuickJoinRoom,
      copyRoomCodeForTesting,
      openLoginTab,
      navigateToRoom,
      confirmDeleteRoom,
      logout
    }
  }
}
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}
</style>
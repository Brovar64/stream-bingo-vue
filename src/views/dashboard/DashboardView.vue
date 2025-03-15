<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="title">Dashboard</h1>
      <div class="flex space-x-4">
        <router-link to="/word-sets" class="btn bg-primary hover:bg-primary-dark text-white">
          Manage Word Sets
        </router-link>
        <div class="dropdown relative group">
          <button class="btn bg-background-lighter hover:bg-gray-700 text-white">
            Manage Punishment Sets ▼
          </button>
          <div class="dropdown-menu hidden group-hover:block absolute bg-background-card rounded shadow-lg py-2 z-50 right-0">
            <router-link 
              to="/punishment-sets/player" 
              class="block px-4 py-2 hover:bg-background-lighter"
            >
              Player Punishments
            </router-link>
            <router-link 
              to="/punishment-sets/creator" 
              class="block px-4 py-2 hover:bg-background-lighter"
            >
              Creator Punishments
            </router-link>
          </div>
        </div>
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
              <option v-for="(set, index) in wordSets" :key="index" :value="index">
                {{ set.name }} ({{ set.items.length }} words)
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
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const roomStore = useRoomStore()
    const notificationStore = useNotificationStore()
    
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
      
      // Load saved word sets
      loadWordSets()
      
      loading.value = false
    })
    
    // Load word sets from local storage
    function loadWordSets() {
      const storedSets = localStorage.getItem('wordSets')
      if (storedSets) {
        try {
          wordSets.value = JSON.parse(storedSets)
        } catch (error) {
          console.error('Failed to parse word sets:', error)
          wordSets.value = []
        }
      }
    }
    
    // Generate random room code
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
            words = [...wordSets.value[setIndex].items]
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
    
    // Join room
    async function handleJoinRoom() {
      joinLoading.value = true
      
      try {
        const roomCode = joinRoomData.value.code.trim().toUpperCase()
        joinRoomData.value.code = roomCode
        
        await roomStore.joinRoom(username.value, roomCode)
        router.push(`/play/${roomCode}`)
      } catch (error) {
        console.error('Join room error:', error)
        notificationStore.showNotification(`Failed to join room: ${error.message}`, 'error')
      } finally {
        joinLoading.value = false
      }
    }
    
    // Navigate to room management
    function navigateToRoom(roomId) {
      router.push(`/admin/room/${roomId}`)
    }
    
    // Confirm and delete room
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
      wordSets,
      username,
      isTestUser,
      generateRandomCode,
      createRoom,
      handleJoinRoom,
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

.dropdown .dropdown-menu {
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
}
</style>

<template>
  <div class="container">
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
    <WaitingGameState 
      v-else-if="!isRoomActive" 
      :room-status="roomData.status" 
    />
    
    <!-- Active game -->
    <div v-else>
      <!-- Header section with StickyHeader -->
      <StickyHeader
        :title="`Punishment Bingo: ${roomId}`"
        status="Active"
        status-variant="success"
      >
        <template #actions>
          <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
            Back to Dashboard
          </router-link>
        </template>
      </StickyHeader>
      
      <p class="subtitle">Playing as: {{ username }}</p>
      
      <!-- Game info section -->
      <BaseCard padding="normal" class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">How to Play</h2>
        </template>
        
        <div>
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
      </BaseCard>
      
      <!-- Main Content - Using same grid layout as host view -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Players List -->
        <div class="lg:col-span-3">
          <PunishmentPlayerList :players="roomData.players || []" />
        </div>
        
        <!-- Right Column: Bingo Grid -->
        <div class="lg:col-span-9">
          <PunishmentPlayerGrid 
            :grid-height="roomData.gridHeight"
            :grid="roomData.grid || {}"
            :called-out-cells="roomData.calledOutCells || []"
            :completed-punishments="roomData.completedPunishments || []"
            :punishment-votes="roomData.punishmentVotes || {}"
            :username="username"
            @vote="votePunishment"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePunishmentRoomStore } from '@/stores/punishment-room'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import PunishmentPlayerGrid from '@/components/punishment/PunishmentPlayerGrid.vue'
import PunishmentPlayerList from '@/components/punishment/PunishmentPlayerList.vue'
import StickyHeader from '@/components/common/StickyHeader.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import WaitingGameState from '@/components/punishment/WaitingGameState.vue'

export default {
  name: 'PunishmentRoomView',
  components: {
    PunishmentPlayerGrid,
    PunishmentPlayerList,
    StickyHeader,
    BaseCard,
    WaitingGameState
  },
  setup() {
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

    return {
      roomId,
      loading,
      error,
      roomData,
      isRoomActive,
      username,
      retryLoading,
      votePunishment
    }
  }
}
</script>
import { ref, computed } from 'vue'

// State
export const currentRoom = ref(null)
export const userRooms = ref([])
export const loading = ref(false)
export const unsubscribeRoomListener = ref(null)

// Getters
export const isRoomLoaded = computed(() => !!currentRoom.value)
export const isRoomActive = computed(() => currentRoom.value?.status === 'active')
export const isRoomSetup = computed(() => currentRoom.value?.status === 'setup')
export const roomWords = computed(() => currentRoom.value?.words || [])
export const roomPlayers = computed(() => currentRoom.value?.players || [])
export const pendingApprovals = computed(() => currentRoom.value?.pendingApprovals || [])
export const playerGrids = computed(() => currentRoom.value?.playerGrids || {})
export const bingoWinners = computed(() => currentRoom.value?.bingoWinners || [])

// Calculate required words for the current grid size
export const requiredWords = computed(() => {
  if (!currentRoom.value) return 0
  const gridSize = currentRoom.value.gridSize || 5
  return gridSize * gridSize
})

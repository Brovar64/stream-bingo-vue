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
      <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="title">Room: {{ roomData.id }}</h1>
            <span 
              :class="['status-badge', roomData.status === 'active' ? 'bg-success' : 'bg-warning']"
            >
              {{ roomData.status === 'active' ? 'Active' : 'Setup' }}
            </span>
          </div>
          <p class="subtitle">{{ roomData.gridSize }}x{{ roomData.gridSize }} Grid</p>
        </div>
        
        <div class="flex flex-wrap gap-3 mt-4 md:mt-0">
          <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
            Back to Dashboard
          </router-link>
          
          <button 
            v-if="isRoomSetup" 
            @click="startGame" 
            :disabled="wordCount < requiredWords"
            :class="['btn', wordCount < requiredWords ? 'bg-gray-600 cursor-not-allowed' : 'btn-primary']"
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
      <div v-if="isRoomActive" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Players</h3>
          <div class="text-2xl font-bold">{{ roomData.players?.length || 0 }}</div>
        </div>
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Pending Approvals</h3>
          <div class="text-2xl font-bold">{{ roomData.pendingApprovals?.length || 0 }}</div>
        </div>
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Bingo Winners</h3>
          <div class="text-2xl font-bold">{{ roomData.bingoWinners?.length || 0 }}</div>
        </div>
      </div>
      
      <!-- Main content area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left column: Room setup (if in setup mode) or Player list -->
        <div class="lg:col-span-1">
          <div v-if="isRoomSetup" class="card">
            <h2 class="text-xl font-semibold mb-4">Add Bingo Words</h2>
            <p class="text-sm text-gray-400 mb-4">
              Add words or phrases that might happen during your stream.
              <span class="text-warning">
                You need {{ requiredWords }} words for a {{ roomData.gridSize }}x{{ roomData.gridSize }} grid.
              </span>
            </p>
            
            <div class="mb-4">
              <div class="progress-bar">
                <div 
                  class="progress" 
                  :style="`width: ${(wordCount / requiredWords) * 100}%`"
                ></div>
              </div>
              <div class="text-sm text-gray-400 mt-1">
                {{ wordCount }} / {{ requiredWords }} words added
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3 mb-4">
              <button 
                @click="showImportModal = true" 
                class="btn bg-background-lighter hover:bg-gray-700 text-white"
              >
                Import Words
              </button>
              
              <button 
                @click="showPasteModal = true" 
                class="btn bg-background-lighter hover:bg-gray-700 text-white"
              >
                Paste Multiple Words
              </button>
            </div>
            
            <form @submit.prevent="addWord" class="mb-4">
              <div class="flex">
                <input 
                  type="text" 
                  v-model="newWord" 
                  class="form-control flex-grow"
                  placeholder="Enter a word or phrase"
                  required
                >
                <button 
                  type="submit" 
                  class="btn btn-primary ml-2"
                  :disabled="!newWord.trim()"
                >
                  Add
                </button>
              </div>
            </form>
            
            <div class="word-list">
              <div v-if="wordCount === 0" class="text-center text-gray-400 py-4">
                No words added yet.
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="(word, index) in roomData.words" 
                  :key="index"
                  class="flex justify-between items-center bg-background-lighter p-2 rounded"
                >
                  <span>{{ word }}</span>
                  <button 
                    @click="removeWord(index)" 
                    class="text-error hover:text-red-300 transition-colors"
                    title="Remove word"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="card">
            <h2 class="text-xl font-semibold mb-4">Players</h2>
            <div v-if="!roomData.players || roomData.players.length === 0" class="text-center py-4 text-gray-400">
              No players have joined yet.
            </div>
            <div v-else class="space-y-2">
              <div 
                v-for="(player, index) in roomData.players" 
                :key="index"
                class="flex justify-between items-center bg-background-lighter p-3 rounded"
              >
                <div>
                  <span class="font-medium">{{ player.nickname }}</span>
                  <div class="text-xs text-gray-400">
                    Joined: {{ formatTime(player.joinedAt) }}
                  </div>
                </div>
                <button 
                  @click="viewPlayerGrid(player.nickname)"
                  class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1 px-2"
                >
                  View Grid
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Center/Right columns: Approval requests and Bingo winners -->
        <div class="lg:col-span-2">
          <div v-if="isRoomActive && roomData.pendingApprovals && roomData.pendingApprovals.length > 0" class="card mb-8">
            <h2 class="text-xl font-semibold mb-4">Pending Approvals</h2>
            <div class="space-y-4">
              <div 
                v-for="(approval, index) in roomData.pendingApprovals" 
                :key="index"
                class="bg-background-lighter p-4 rounded-lg"
              >
                <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div class="mb-3 md:mb-0">
                    <div class="font-medium">{{ approval.playerName }}</div>
                    <div class="text-primary text-lg font-semibold">"{{ approval.word }}"</div>
                    <div class="text-xs text-gray-400 mt-1">
                      Cell: Row {{ approval.row + 1 }}, Column {{ approval.col + 1 }}
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button 
                      @click="approvePlayerMark(index)"
                      class="btn bg-success hover:bg-green-700 text-white"
                    >
                      Approve
                    </button>
                    <button 
                      @click="rejectPlayerMark(index)"
                      class="btn bg-error hover:bg-red-700 text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="isRoomActive && roomData.bingoWinners && roomData.bingoWinners.length > 0" class="card">
            <h2 class="text-xl font-semibold mb-4">Bingo Winners</h2>
            <div class="space-y-2">
              <div 
                v-for="(winner, index) in roomData.bingoWinners" 
                :key="index"
                class="bg-background-lighter p-3 rounded-lg flex justify-between items-center"
              >
                <div class="flex items-center">
                  <span class="text-yellow-400 text-2xl mr-3">🏆</span>
                  <span class="font-medium">{{ winner }}</span>
                </div>
                <button 
                  @click="viewPlayerGrid(winner)"
                  class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1 px-2"
                >
                  View Grid
                </button>
              </div>
            </div>
          </div>
          
          <!-- Player Grid View -->
          <div v-if="selectedPlayer && roomData.playerGrids && roomData.playerGrids[selectedPlayer]" class="card mt-8">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">{{ selectedPlayer }}'s Bingo Grid</h2>
              <button @click="selectedPlayer = null" class="text-gray-400 hover:text-white">
                Close ✕
              </button>
            </div>
            
            <div class="flex justify-center">
              <div class="bingo-grid" :style="`grid-template-columns: repeat(${roomData.gridSize}, 1fr);`">
                <template v-for="row in roomData.gridSize" :key="`row-${row}`">
                  <div 
                    v-for="col in roomData.gridSize" 
                    :key="`${row-1}_${col-1}`"
                    :class="['bingo-cell', getCellClasses(`${row-1}_${col-1}`)]"
                  >
                    <div class="bingo-cell-content">
                      {{ getCellWord(`${row-1}_${col-1}`) }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          
          <!-- Room Code Display -->
          <div v-if="isRoomActive" class="mt-8 card bg-background-lighter">
            <div class="text-center">
              <h2 class="text-xl font-semibold mb-2">Share Room Code</h2>
              <p class="text-gray-400 mb-4">Give this code to your viewers so they can join</p>
              <div class="text-3xl font-bold text-primary tracking-widest my-4">{{ roomData.id }}</div>
              <button 
                @click="copyRoomCode" 
                class="btn bg-background-card hover:bg-gray-700 text-white"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Import From Word Set Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Import from Word Set</h2>
          <button @click="showImportModal = false" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <div v-if="wordSets.length === 0" class="text-center py-4 mb-6">
          <p class="text-gray-400 mb-2">You don't have any word sets yet.</p>
          <router-link to="/word-sets" class="text-primary hover:text-primary-light">
            Create a word set first
          </router-link>
        </div>
        
        <div v-else>
          <div class="form-group mb-6">
            <label for="wordSetSelect" class="block text-sm text-gray-400 mb-2">Select a Word Set</label>
            <select 
              id="wordSetSelect" 
              v-model="selectedWordSetId" 
              class="form-control w-full"
            >
              <option v-for="(set, index) in wordSets" :key="index" :value="index">
                {{ set.name }} ({{ set.words.length }} words)
              </option>
            </select>
          </div>
          
          <div v-if="selectedWordSetId !== null" class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-sm text-gray-400">Word List Preview</h3>
              <span class="text-xs text-gray-500">{{ wordSets[selectedWordSetId].words.length }} words</span>
            </div>
            <div class="bg-background-lighter p-3 rounded h-40 overflow-y-auto">
              <div v-for="(word, wordIndex) in wordSets[selectedWordSetId].words.slice(0, 10)" :key="wordIndex" class="text-sm mb-1">
                {{ word }}
              </div>
              <div v-if="wordSets[selectedWordSetId].words.length > 10" class="text-xs text-gray-500 italic mt-2">
                And {{ wordSets[selectedWordSetId].words.length - 10 }} more...
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showImportModal = false" 
              class="btn bg-background-lighter hover:bg-gray-700 text-white"
            >
              Cancel
            </button>
            <button 
              @click="importWordSet" 
              class="btn btn-primary"
              :disabled="selectedWordSetId === null"
            >
              Import Words
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Paste Multiple Words Modal -->
    <div v-if="showPasteModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-2xl p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Paste Multiple Words</h2>
          <button @click="showPasteModal = false" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-sm text-gray-400 mb-2">
            Paste words or phrases, one per line. Empty lines will be ignored.
          </p>
          <textarea 
            v-model="multipleWords" 
            class="form-control w-full h-48 font-mono"
            placeholder="Enter each word or phrase on a new line..."
          ></textarea>
        </div>
        
        <div class="flex items-center justify-between mb-6">
          <label for="wordListFile" class="btn bg-background-lighter hover:bg-gray-700 text-white cursor-pointer">
            Import from TXT File
          </label>
          <input 
            type="file" 
            id="wordListFile" 
            accept=".txt" 
            @change="handleFileImport" 
            class="hidden"
          >
          
          <div class="text-sm text-gray-400">
            <span class="font-bold">{{ parsedWords.length }}</span> words detected
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showPasteModal = false" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button 
            @click="addMultipleWords" 
            class="btn btn-primary"
            :disabled="parsedWords.length === 0"
          >
            Add Words
          </button>
        </div>
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
  name: 'AdminRoomView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const roomStore = useRoomStore()
    const notificationStore = useNotificationStore()
    
    // Room ID from route params
    const roomId = route.params.id
    
    // State
    const loading = ref(true)
    const newWord = ref('')
    const selectedPlayer = ref(null)
    const showImportModal = ref(false)
    const showPasteModal = ref(false)
    const selectedWordSetId = ref(null)
    const multipleWords = ref('')
    const wordSets = ref([])
    
    // Computed properties
    const roomData = computed(() => roomStore.currentRoom)
    const isRoomSetup = computed(() => roomStore.isRoomSetup)
    const isRoomActive = computed(() => roomStore.isRoomActive)
    const wordCount = computed(() => roomData.value?.words?.length || 0)
    const requiredWords = computed(() => roomStore.requiredWords)
    
    const parsedWords = computed(() => {
      if (!multipleWords.value.trim()) return []
      return multipleWords.value
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
    })
    
    // Load room data on component mount
    onMounted(async () => {
      loading.value = true
      
      try {
        await roomStore.loadRoom(roomId)
        loadWordSets()
        loading.value = false
      } catch (error) {
        console.error('Error loading room:', error)
        notificationStore.showNotification('Error loading room', 'error')
        router.push('/dashboard')
      }
    })
    
    // Load saved word sets
    function loadWordSets() {
      const storedSets = localStorage.getItem('bingoWordSets')
      if (storedSets) {
        try {
          wordSets.value = JSON.parse(storedSets)
        } catch (error) {
          console.error('Failed to parse word sets:', error)
          wordSets.value = []
        }
      }
    }
    
    // Handle file import
    function handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = e => {
        multipleWords.value = e.target.result
      }
      reader.onerror = () => {
        notificationStore.showNotification('Failed to read file', 'error')
      }
      reader.readAsText(file)
    }
    
    // Import words from a saved word set
    async function importWordSet() {
      if (selectedWordSetId.value === null) return
      
      const wordSet = wordSets.value[selectedWordSetId.value]
      if (!wordSet || !wordSet.words || wordSet.words.length === 0) {
        notificationStore.showNotification('Selected word set is empty', 'error')
        return
      }
      
      // Add words from the set
      const result = await roomStore.addMultipleWords(wordSet.words)
      
      if (result) {
        notificationStore.showNotification(`Imported ${wordSet.words.length} words from "${wordSet.name}"`, 'success')
        showImportModal.value = false
      }
    }
    
    // Add multiple words at once
    async function addMultipleWords() {
      if (parsedWords.value.length === 0) return
      
      const result = await roomStore.addMultipleWords(parsedWords.value)
      
      if (result) {
        notificationStore.showNotification(`Added ${parsedWords.value.length} words`, 'success')
        multipleWords.value = ''
        showPasteModal.value = false
      }
    }
    
    // Cleanup on component unmount
    onUnmounted(() => {
      roomStore.cleanup()
    })
    
    // Methods
    
    // Add a word to the list
    async function addWord() {
      if (!newWord.value.trim()) return
      
      const success = await roomStore.addWord(newWord.value.trim())
      
      if (success) {
        newWord.value = '' // Clear input on success
      }
    }
    
    // Remove a word from the list
    async function removeWord(index) {
      await roomStore.removeWord(index)
    }
    
    // Start the game
    async function startGame() {
      if (wordCount.value < requiredWords.value) {
        notificationStore.showNotification(
          `You need ${requiredWords.value} words to start the game`,
          'warning'
        )
        return
      }
      
      const success = await roomStore.startGame()
      
      if (success) {
        notificationStore.showNotification('Game started successfully!', 'success')
      }
    }
    
    // Reset the game
    async function resetGame() {
      if (confirm('Are you sure you want to reset the game? This will clear all player grids and marks.')) {
        const success = await roomStore.resetGame()
        
        if (success) {
          notificationStore.showNotification('Game reset to setup mode', 'success')
        }
      }
    }
    
    // Approve a player's mark
    async function approvePlayerMark(index) {
      await roomStore.approvePlayerMark(index)
    }
    
    // Reject a player's mark
    async function rejectPlayerMark(index) {
      await roomStore.rejectPlayerMark(index)
    }
    
    // View a player's grid
    function viewPlayerGrid(playerName) {
      selectedPlayer.value = playerName
    }
    
    // Format timestamp
    function formatTime(timestamp) {
      if (!timestamp) return 'Unknown'
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString()
    }
    
    // Get cell classes based on state
    function getCellClasses(cellKey) {
      if (!selectedPlayer.value || !roomData.value?.playerGrids?.[selectedPlayer.value]) return ''
      
      const cell = roomData.value.playerGrids[selectedPlayer.value][cellKey]
      if (!cell) return ''
      
      const classes = []
      
      if (cell.marked && cell.approved) {
        classes.push('marked approved')
      } else if (cell.marked) {
        classes.push('marked pending')
      }
      
      return classes.join(' ')
    }
    
    // Get cell word
    function getCellWord(cellKey) {
      if (!selectedPlayer.value || !roomData.value?.playerGrids?.[selectedPlayer.value]) return ''
      
      const cell = roomData.value.playerGrids[selectedPlayer.value][cellKey]
      return cell ? cell.word : ''
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
    
    return {
      loading,
      roomData,
      newWord,
      selectedPlayer,
      showImportModal,
      showPasteModal,
      selectedWordSetId,
      multipleWords,
      wordSets,
      parsedWords,
      isRoomSetup,
      isRoomActive,
      wordCount,
      requiredWords,
      addWord,
      removeWord,
      startGame,
      resetGame,
      approvePlayerMark,
      rejectPlayerMark,
      viewPlayerGrid,
      formatTime,
      getCellClasses,
      getCellWord,
      copyRoomCode,
      handleFileImport,
      importWordSet,
      addMultipleWords
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
</style>
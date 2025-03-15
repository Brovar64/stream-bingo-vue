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
            <h1 class="title">Room: {{ roomData.id }}</h1>
            <span 
              :class="['status-badge', roomData.status === 'active' ? 'bg-success' : 'bg-warning']"
            >
              {{ roomData.status === 'active' ? 'Active' : 'Setup' }}
            </span>
          </div>
          <p class="subtitle">{{ roomData.gridSize }}x{{ roomData.gridSize }} Grid</p>
        </div>
        
        <div class="flex flex-wrap gap-3 mt-4 md:mt-0 items-center">
          <!-- Room Code Display - Moved to header when room is active -->
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
      <div v-if="isRoomActive" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      
      <!-- Setup Mode Content -->
      <div v-if="isRoomSetup">
        <div class="card mb-6">
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
      </div>
      
      <!-- Active Game Content - Two Column Layout -->
      <div v-if="isRoomActive" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Players -->
        <div class="lg:col-span-5">
          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Players</h2>
            <div v-if="!roomData.players || roomData.players.length === 0" class="text-center py-4 text-gray-400">
              No players have joined yet.
            </div>
            <div v-else class="space-y-2 max-h-[500px] overflow-y-auto">
              <div 
                v-for="(player, index) in roomData.players" 
                :key="index"
                :class="['flex justify-between items-center p-3 rounded cursor-pointer', 
                         selectedPlayer === player.nickname ? 'bg-primary bg-opacity-20' : 'bg-background-lighter',
                         isPlayerWinner(player.nickname) ? 'border-2 border-yellow-400' : '']"
                @click="viewPlayerGrid(player.nickname)"
              >
                <div>
                  <div class="flex items-center">
                    <span class="font-medium">{{ player.nickname }}</span>
                    <span v-if="isPlayerWinner(player.nickname)" class="ml-2 text-yellow-400">🏆 BINGO!</span>
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    <span v-if="getPlayerStats(player.nickname)">
                      {{ getPlayerStats(player.nickname).approved }} / {{ roomData.gridSize * roomData.gridSize }} words marked
                    </span>
                    <span v-else>Joined: {{ formatTime(player.joinedAt) }}</span>
                  </div>
                </div>
                <div 
                  class="text-primary hover:text-primary-light"
                >
                  View →
                </div>
              </div>
            </div>
          </div>
          
          <!-- Player Grid View (when player is selected) -->
          <PlayerGridView
            v-if="selectedPlayer && roomData.playerGrids && roomData.playerGrids[selectedPlayer]"
            :playerName="selectedPlayer"
            :gridSize="roomData.gridSize"
            :playerGrid="roomData.playerGrids[selectedPlayer]"
            @close="selectedPlayer = null"
            class="mt-6"
          />
        </div>
        
        <!-- Right Column: Bingo Words and Approvals -->
        <div class="lg:col-span-7">
          <!-- Words List in Grid Layout -->
          <div class="card mb-6">
            <h2 class="text-xl font-semibold mb-4">Bingo Words</h2>
            <div class="flex justify-between items-center mb-4">
              <p class="text-sm text-gray-400">
                Click on a word to toggle its called status.
              </p>
              <div class="flex gap-2 items-center text-sm">
                <span class="flex items-center">
                  <span class="w-3 h-3 inline-block bg-success bg-opacity-20 border border-success rounded-full mr-1"></span>
                  Called
                </span>
                <span class="flex items-center ml-2">
                  <span class="w-3 h-3 inline-block bg-background-lighter rounded-full mr-1"></span>
                  Not Called
                </span>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-1">
              <div 
                v-for="(word, index) in roomData.words" 
                :key="index"
                :class="['bingo-word-card', 
                        isWordCalledOut(word) ? 'called-out' : '']"
                @click="callOutWord(word)"
              >
                <div class="bingo-word-content">{{ word }}</div>
                
                <div class="bingo-word-status">
                  <span v-if="isWordCalledOut(word)" class="called-toggle check">✓</span>
                  <span v-else class="called-toggle uncheck">+</span>
                </div>
              </div>
            </div>
            
            <div class="flex justify-between text-sm text-gray-400 mt-4">
              <span>{{ calledOutWordsCount }} / {{ wordCount }} words called</span>
              <button 
                @click="resetCalledWords" 
                class="text-primary hover:text-primary-light"
              >
                Reset Called Words
              </button>
            </div>
          </div>
          
          <!-- Approvals List -->
          <ApprovalsList
            v-if="roomData.pendingApprovals && roomData.pendingApprovals.length > 0"
            :approvals="roomData.pendingApprovals"
            @approve="approvePlayerMark"
            @reject="rejectPlayerMark"
            class="mb-6"
          />
          
          <!-- Bingo Winners List -->
          <div v-if="roomData.bingoWinners && roomData.bingoWinners.length > 0" class="card mb-6">
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
        </div>
      </div>
    </div>
    
    <!-- Word Set Importer Modal -->
    <WordSetImporter
      v-if="showImportModal"
      :wordSets="wordSets"
      @close="showImportModal = false"
      @import="importWordSet"
      @error="handleImportError"
    />
    
    <!-- Multi Words Paste Modal -->
    <MultiWordsPaste
      v-if="showPasteModal"
      v-model="multipleWords"
      :parsedWords="parsedWords"
      @close="showPasteModal = false"
      @add="addMultipleWords"
      @file-import="handleFileImport"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room/'
import { useNotificationStore } from '@/stores/notification'
import PlayerGridView from '@/components/bingo/PlayerGridView.vue'
import ApprovalsList from '@/components/bingo/ApprovalsList.vue'
import WordSetImporter from '@/components/bingo/WordSetImporter.vue'
import MultiWordsPaste from '@/components/bingo/MultiWordsPaste.vue'

export default {
  name: 'AdminRoomView',
  components: {
    PlayerGridView,
    ApprovalsList,
    WordSetImporter,
    MultiWordsPaste
  },
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
    const multipleWords = ref('')
    const wordSets = ref([])
    
    // Computed properties
    const roomData = computed(() => roomStore.currentRoom)
    const isRoomSetup = computed(() => roomStore.isRoomSetup)
    const isRoomActive = computed(() => roomStore.isRoomActive)
    const wordCount = computed(() => roomData.value?.words?.length || 0)
    const requiredWords = computed(() => roomStore.requiredWords)
    const calledOutWordsCount = computed(() => roomData.value?.calledOutWords?.length || 0)
    
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
    
    // Handle import errors
    function handleImportError(message) {
      notificationStore.showNotification(message, 'error')
    }
    
    // Import words from a saved word set
    async function importWordSet(wordSetId) {
      if (wordSetId === null || wordSetId === undefined) return
      
      const wordSet = wordSets.value[wordSetId]
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
    
    // Call out a word
    function callOutWord(word) {
      // Toggle the word's called-out status
      roomStore.markWordForAllPlayers(word)
    }
    
    // Reset called out words
    function resetCalledWords() {
      // Reset all called out words
      roomStore.resetCalledOutWords()
    }
    
    // Check if a word is called out
    function isWordCalledOut(word) {
      return roomData.value?.calledOutWords?.includes(word) || false
    }
    
    // Check if player is a winner
    function isPlayerWinner(playerName) {
      return roomData.value?.bingoWinners?.includes(playerName) || false
    }
    
    // Get player stats
    function getPlayerStats(playerName) {
      if (!roomData.value?.playerGrids?.[playerName]) return null
      
      const grid = roomData.value.playerGrids[playerName]
      const cells = Object.values(grid)
      
      const marked = cells.filter(cell => cell.marked).length
      const approved = cells.filter(cell => cell.marked && cell.approved).length
      const pending = marked - approved
      
      return { marked, approved, pending }
    }
    
    // Format timestamp
    function formatTime(timestamp) {
      if (!timestamp) return 'Unknown'
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString()
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
      multipleWords,
      wordSets,
      parsedWords,
      isRoomSetup,
      isRoomActive,
      wordCount,
      requiredWords,
      calledOutWordsCount,
      addWord,
      removeWord,
      startGame,
      resetGame,
      approvePlayerMark,
      rejectPlayerMark,
      viewPlayerGrid,
      copyRoomCode,
      handleFileImport,
      importWordSet,
      handleImportError,
      addMultipleWords,
      callOutWord,
      resetCalledWords,
      isWordCalledOut,
      isPlayerWinner,
      getPlayerStats,
      formatTime
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

/* Bingo word card styling */
.bingo-word-card {
  @apply relative bg-background-lighter p-3 rounded flex items-center justify-between transition-colors cursor-pointer;
  min-height: 60px;
}

.bingo-word-card:hover {
  @apply bg-gray-700;
}

.bingo-word-card.called-out {
  @apply bg-success bg-opacity-20 border border-success;
}

.bingo-word-card.called-out:hover {
  @apply bg-success bg-opacity-30;
}

.bingo-word-content {
  @apply overflow-hidden break-words w-full text-sm pr-6;
  word-break: break-word;
}

.called-toggle {
  @apply absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-sm font-bold;
  transition: all 0.2s ease;
}

.called-toggle.check {
  @apply bg-success text-white;
}

.called-toggle.uncheck {
  @apply bg-gray-600 text-gray-300 rotate-45;
}

.bingo-word-card:hover .called-toggle.check {
  @apply bg-red-500;
  transform: translateY(-50%) rotate(45deg);
  content: "×";
}

.bingo-word-card:hover .called-toggle.uncheck {
  @apply bg-success text-white rotate-0;
}
</style>
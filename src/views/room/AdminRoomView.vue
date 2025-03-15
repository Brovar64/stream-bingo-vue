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
      
      <!-- Master Bingo Grid (only shown when room is active) -->
      <MasterBingoGrid
        v-if="isRoomActive"
        :words="roomData.words || []"
        :gridSize="roomData.gridSize"
        :roomId="roomData.id"
        @call-out-word="callOutWord"
        @reset-called-words="resetCalledWords"
      />
      
      <!-- Main content area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left column: Room setup (if in setup mode) or Player list -->
        <div class="lg:col-span-1">
          <!-- Word addition section (setup mode) -->
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
          
          <!-- Player List (active mode) -->
          <PlayerList
            v-else
            :players="roomData.players || []"
            :selectedPlayer="selectedPlayer"
            :gridSize="roomData.gridSize"
            :winners="roomData.bingoWinners || []"
            :playerGrids="roomData.playerGrids || {}"
            @view-player="viewPlayerGrid"
          />
        </div>
        
        <!-- Center/Right columns: Approval requests and Bingo winners -->
        <div class="lg:col-span-2">
          <!-- Approvals List -->
          <ApprovalsList
            v-if="isRoomActive && roomData.pendingApprovals && roomData.pendingApprovals.length > 0"
            :approvals="roomData.pendingApprovals"
            @approve="approvePlayerMark"
            @reject="rejectPlayerMark"
            class="mb-8"
          />
          
          <!-- Bingo Winners List -->
          <div v-if="isRoomActive && roomData.bingoWinners && roomData.bingoWinners.length > 0" class="card mb-8">
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
          <PlayerGridView
            v-if="selectedPlayer && roomData.playerGrids && roomData.playerGrids[selectedPlayer]"
            :playerName="selectedPlayer"
            :gridSize="roomData.gridSize"
            :playerGrid="roomData.playerGrids[selectedPlayer]"
            @close="selectedPlayer = null"
            class="mb-8"
          />
          
          <!-- Room Code Display -->
          <RoomCodeDisplay
            v-if="isRoomActive"
            :roomId="roomData.id"
            @copy="copyRoomCode"
          />
        </div>
      </div>
    </div>
    
    <!-- Word Set Importer Modal -->
    <WordSetImporter
      v-if="showImportModal"
      :wordSets="wordSets"
      @close="showImportModal = false"
      @import="importWordSet"
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
import { useRoomStore } from '@/stores/room'
import { useNotificationStore } from '@/stores/notification'
import PlayerList from '@/components/bingo/PlayerList.vue'
import MasterBingoGrid from '@/components/bingo/MasterBingoGrid.vue'
import PlayerGridView from '@/components/bingo/PlayerGridView.vue'
import ApprovalsList from '@/components/bingo/ApprovalsList.vue'
import RoomCodeDisplay from '@/components/bingo/RoomCodeDisplay.vue'
import WordSetImporter from '@/components/bingo/WordSetImporter.vue'
import MultiWordsPaste from '@/components/bingo/MultiWordsPaste.vue'

export default {
  name: 'AdminRoomView',
  components: {
    PlayerList,
    MasterBingoGrid,
    PlayerGridView,
    ApprovalsList,
    RoomCodeDisplay,
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
    async function importWordSet(wordSetId) {
      if (wordSetId === null) return
      
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
    
    // Call out a word in master grid
    function callOutWord(word) {
      // Mark this word as called out for all players
      // This would need to be implemented in your roomStore
      roomStore.markWordForAllPlayers(word)
    }
    
    // Reset called out words
    function resetCalledWords() {
      // Reset all called out words
      // This would need to be implemented in your roomStore
      roomStore.resetCalledOutWords()
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
      addMultipleWords,
      callOutWord,
      resetCalledWords
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
</style>
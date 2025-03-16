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
      <RoomHeader
        :room-data="roomData"
        :is-room-active="isRoomActive"
        :is-room-setup="isRoomSetup"
        :word-count="wordCount"
        :required-words="requiredWords"
        @start-game="startGame"
        @reset-game="resetGame"
        @copy-room-code="copyRoomCode"
      />

      <!-- Game statistics -->
      <GameStats
        v-if="isRoomActive"
        :players-count="roomData.players?.length || 0"
        :pending-approvals-count="roomData.pendingApprovals?.length || 0"
        :winners-count="roomData.bingoWinners?.length || 0"
      />

      <!-- Setup Mode Content -->
      <SetupModePanel
        v-if="isRoomSetup"
        :words="roomData.words || []"
        :required-words="requiredWords"
        :grid-size="roomData.gridSize"
        :no-word-sets="wordSetStore.wordSets.length === 0"
        @add-word="addWord"
        @remove-word="removeWord"
        @open-import-modal="showImportModal = true"
        @open-paste-modal="showPasteModal = true"
      />

      <!-- Active Game Content - Two Column Layout -->
      <div v-if="isRoomActive" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Players -->
        <div class="lg:col-span-3">
          <PlayersList
            :players="roomData.players || []"
            :player-grids="roomData.playerGrids || {}"
            :winners="roomData.bingoWinners || []"
            :selected-player="selectedPlayer"
            :grid-size="roomData.gridSize"
            @player-selected="selectedPlayer = $event"
          />
        </div>

        <!-- Right Column: Bingo Words and Approvals -->
        <div class="lg:col-span-9">
          <!-- Words List in Grid Layout -->
          <BingoWordsGrid
            :words="filteredAndSortedWords"
            :called-out-words="roomData.calledOutWords || []"
            :pending-approvals="roomData.pendingApprovals || []"
            :total-words="wordCount"
            :sort-by="sortBy"
            :sort-order="sortOrder"
            @toggle-word-called-out="callOutWord"
            @reset-called-words="resetCalledWords"
            @approve-word="approveWord"
            @reject-word="rejectWord"
            @sort-change="handleSortChange"
            @search-change="searchQuery = $event"
          />

          <!-- Bingo Winners List -->
          <WinnersPanel
            :winners="roomData.bingoWinners || []"
            :selected-player="selectedPlayer"
            @player-selected="selectedPlayer = $event"
          />
        </div>
      </div>
    </div>

    <!-- Word Set Importer Modal -->
    <WordSetImporter
      v-model:visible="showImportModal"
      :word-sets="wordSetStore.wordSets"
      @import-set="importSet"
    />

    <!-- Multi Words Paste Modal -->
    <MultiWordsPaste
      v-if="showPasteModal"
      v-model="multipleWords"
      :parsed-words="parsedWords"
      @close="showPasteModal = false"
      @add-words="addMultipleWords"
      @error="handleImportError"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/room/'
import { useNotificationStore } from '@/stores/notification'
import { useWordSetStore } from '@/stores/word-sets'

// Import existing components
import MultiWordsPaste from '@/components/bingo/MultiWordsPaste.vue'

// Import new components
import RoomHeader from '@/components/admin/RoomHeader.vue'
import GameStats from '@/components/admin/GameStats.vue'
import SetupModePanel from '@/components/admin/SetupModePanel.vue'
import PlayersList from '@/components/admin/PlayersList.vue'
import BingoWordsGrid from '@/components/admin/BingoWordsGrid.vue'
import WinnersPanel from '@/components/admin/WinnersPanel.vue'
import WordSetImporter from '@/components/admin/WordSetImporter.vue'

export default {
  name: 'AdminRoomView',
  components: {
    RoomHeader,
    GameStats,
    SetupModePanel,
    PlayersList,
    BingoWordsGrid,
    WinnersPanel,
    WordSetImporter,
    MultiWordsPaste
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const roomStore = useRoomStore()
    const notificationStore = useNotificationStore()
    const wordSetStore = useWordSetStore()

    // Room ID from route params
    const roomId = route.params.id

    // State
    const loading = ref(true)
    const newWord = ref('')
    const selectedPlayer = ref(null)
    const showImportModal = ref(false)
    const showPasteModal = ref(false)
    const multipleWords = ref('')
    const selectedSetId = ref('')

    // Search and sort state
    const searchQuery = ref('')
    const sortBy = ref('alphabetical') // 'alphabetical' or 'calledOut'
    const sortOrder = ref('asc') // 'asc' or 'desc'

    // Computed properties
    const roomData = computed(() => roomStore.currentRoom)
    const isRoomSetup = computed(() => roomStore.isRoomSetup)
    const isRoomActive = computed(() => roomStore.isRoomActive)
    const wordCount = computed(() => roomData.value?.words?.length || 0)
    const requiredWords = computed(() => roomStore.requiredWords)
    const calledOutWordsCount = computed(() => roomData.value?.calledOutWords?.length || 0)

    // Filtered and sorted words
    const filteredAndSortedWords = computed(() => {
      if (!roomData.value?.words) return []

      // First filter by search query
      let result = [...roomData.value.words]

      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        result = result.filter(word =>
            word.toLowerCase().includes(query)
        )
      }

      // Then sort
      if (sortBy.value === 'alphabetical') {
        result.sort((a, b) => {
          return sortOrder.value === 'asc'
              ? a.localeCompare(b)
              : b.localeCompare(a)
        })
      } else if (sortBy.value === 'calledOut') {
        result.sort((a, b) => {
          const aCalledOut = isWordCalledOut(a)
          const bCalledOut = isWordCalledOut(b)

          if (aCalledOut === bCalledOut) return 0

          if (sortOrder.value === 'asc') {
            return aCalledOut ? -1 : 1
          } else {
            return aCalledOut ? 1 : -1
          }
        })
      }

      return result
    })

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
        await wordSetStore.loadWordSets()
        loading.value = false
      } catch (error) {
        console.error('Error loading room:', error)
        notificationStore.showNotification('Error loading room', 'error')
        router.push('/dashboard')
      }
    })

    // Handle import errors
    function handleImportError(message) {
      notificationStore.showNotification(message, 'error')
    }

    // Import words from a saved word set
    async function importSet(setId) {
      if (!setId) return

      const selectedSet = wordSetStore.wordSets.find(set => set.id === setId)
      if (!selectedSet || !selectedSet.items || selectedSet.items.length === 0) {
        notificationStore.showNotification('Selected word set is empty', 'error')
        return
      }

      // Add words from the set
      const result = await roomStore.addMultipleWords(selectedSet.items)

      if (result) {
        notificationStore.showNotification(`Imported ${selectedSet.items.length} words from "${selectedSet.name}"`, 'success')
        showImportModal.value = false
        selectedSetId.value = ''
      }
    }

    // Add multiple words at once
    async function addMultipleWords(words) {
      if (!words || words.length === 0) return

      const result = await roomStore.addMultipleWords(words)

      if (result) {
        notificationStore.showNotification(`Added ${words.length} words`, 'success')
        multipleWords.value = ''
        showPasteModal.value = false
      }
    }

    // Call out a word
    function callOutWord(word) {
      // Mark this word as called out for all players
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

    // Handle sort change
    function handleSortChange({ sortBy: newSortBy, sortOrder: newSortOrder }) {
      sortBy.value = newSortBy
      sortOrder.value = newSortOrder
    }

    // Approve a player's mark
    async function approveWord(approval) {
      const index = getApprovalIndex(approval)
      if (index >= 0) {
        await roomStore.approvePlayerMark(index)
      }
    }

    // Reject a player's mark
    async function rejectWord(approval) {
      const index = getApprovalIndex(approval)
      if (index >= 0) {
        await roomStore.rejectPlayerMark(index)
      }
    }

    // Get the index of an approval in the pendingApprovals array
    function getApprovalIndex(approval) {
      if (!roomData.value?.pendingApprovals) return -1
      return roomData.value.pendingApprovals.findIndex(a =>
          a.playerName === approval.playerName &&
          a.word === approval.word &&
          a.row === approval.row &&
          a.col === approval.col)
    }

    // Cleanup on component unmount
    onUnmounted(() => {
      roomStore.cleanup()
    })

    // Add a word to the list
    async function addWord(word) {
      if (!word.trim()) return

      const success = await roomStore.addWord(word.trim())

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

    // Copy room code to clipboard
    function copyRoomCode(roomId) {
      if (!roomId) return

      navigator.clipboard.writeText(roomId)
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
      wordSetStore,
      selectedSetId,
      parsedWords,
      isRoomSetup,
      isRoomActive,
      wordCount,
      requiredWords,
      calledOutWordsCount,
      searchQuery,
      sortBy,
      sortOrder,
      filteredAndSortedWords,
      addWord,
      removeWord,
      startGame,
      resetGame,
      approveWord,
      rejectWord,
      copyRoomCode,
      handleImportError,
      importSet,
      addMultipleWords,
      callOutWord,
      resetCalledWords,
      isWordCalledOut,
      handleSortChange
    }
  }
}
</script>

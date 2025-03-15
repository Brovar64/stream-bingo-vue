<template>
  <div class="card mb-6">
    <h2 class="text-xl font-semibold mb-4">Master Bingo Grid</h2>
    <p class="text-sm text-gray-400 mb-4">
      Click on a word to mark it as called out. This will mark it for all players who have this word.
    </p>
    
    <div class="flex justify-center mb-4">
      <div class="bingo-grid" :style="`grid-template-columns: repeat(${gridSize}, 1fr);`">
        <template v-for="(word, index) in words" :key="index">
          <div 
            :class="['master-bingo-cell', calledOutWords.includes(word) ? 'called-out' : '']"
            @click="callOutWord(word)"
          >
            <div class="bingo-cell-content">
              {{ word }}
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <div class="flex justify-between text-sm text-gray-400">
      <span>{{ calledOutWords.length }} / {{ words.length }} words called</span>
      <button 
        @click="resetCalledWords" 
        class="text-primary hover:text-primary-light"
      >
        Reset Called Words
      </button>
    </div>
  </div>
</template>

<script>
import { useRoomStore } from '@/stores/room/'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'MasterBingoGrid',
  props: {
    words: {
      type: Array,
      required: true
    },
    gridSize: {
      type: Number,
      required: true
    },
    roomId: {
      type: String,
      required: true
    }
  },
  emits: ['call-out-word', 'reset-called-words'],
  data() {
    return {
      calledOutWords: []
    }
  },
  setup() {
    const roomStore = useRoomStore()
    const notificationStore = useNotificationStore()
    
    return {
      roomStore,
      notificationStore
    }
  },
  mounted() {
    // Load called out words from the room store or initialize from local storage
    if (this.roomStore.currentRoom?.calledOutWords) {
      this.calledOutWords = [...this.roomStore.currentRoom.calledOutWords]
    } else {
      // Fallback to local storage if not in store
      const storedCalledWords = localStorage.getItem(`room_${this.roomId}_calledWords`)
      if (storedCalledWords) {
        try {
          this.calledOutWords = JSON.parse(storedCalledWords)
        } catch (error) {
          console.error('Failed to parse called out words:', error)
          this.calledOutWords = []
        }
      }
    }
  },
  methods: {
    async callOutWord(word) {
      try {
        // Call the store method to mark word for all players
        await this.roomStore.markWordForAllPlayers(word)
        
        // Update local state from room
        if (this.roomStore.currentRoom?.calledOutWords) {
          this.calledOutWords = [...this.roomStore.currentRoom.calledOutWords]
        }
        
        // Emit event to parent
        this.$emit('call-out-word', word)
      } catch (error) {
        console.error('Error calling out word:', error)
        this.notificationStore.showNotification(`Error marking word: ${error.message}`, 'error')
      }
    },
    
    async resetCalledWords() {
      try {
        // Call the store method to reset called words
        await this.roomStore.resetCalledOutWords()
        
        // Update local state
        this.calledOutWords = []
        
        // Clear local storage
        localStorage.removeItem(`room_${this.roomId}_calledWords`)
        
        // Emit event to parent
        this.$emit('reset-called-words')
      } catch (error) {
        console.error('Error resetting called words:', error)
        this.notificationStore.showNotification(`Error resetting called words: ${error.message}`, 'error')
      }
    }
  }
}
</script>

<style scoped>
.bingo-grid {
  display: grid;
  grid-gap: 8px;
  width: 100%;
  max-width: 600px;
}

.master-bingo-cell {
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
  cursor: pointer;
  transition: all 0.2s ease;
}

.master-bingo-cell:hover {
  transform: scale(1.02);
}

.master-bingo-cell.called-out {
  background-color: rgba(76, 175, 80, 0.2);
  border: 2px solid theme('colors.success');
}

.bingo-cell-content {
  width: 100%;
  overflow-wrap: break-word;
  hyphens: auto;
}
</style>

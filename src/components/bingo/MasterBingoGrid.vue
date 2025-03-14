<template>
  <div class="card mb-6">
    <h2 class="text-xl font-semibold mb-4">Master Bingo Grid</h2>
    <p class="text-sm text-gray-400 mb-4">
      Click on a word to mark it as called out. This will mark it for all players who have this word.
    </p>
    
    <div class="flex justify-center mb-4">
      <div class="bingo-grid" :style="`grid-template-columns: repeat(${gridSize}, 1fr);`">
        <template v-for="(word, index) in words.slice(0, gridSize * gridSize)" :key="index">
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
  mounted() {
    // Load called out words from local storage if they exist
    const storedCalledWords = localStorage.getItem(`room_${this.roomId}_calledWords`)
    if (storedCalledWords) {
      try {
        this.calledOutWords = JSON.parse(storedCalledWords)
      } catch (error) {
        console.error('Failed to parse called out words:', error)
        this.calledOutWords = []
      }
    }
  },
  methods: {
    callOutWord(word) {
      // Toggle the word in the called out list
      if (this.calledOutWords.includes(word)) {
        this.calledOutWords = this.calledOutWords.filter(w => w !== word)
      } else {
        this.calledOutWords.push(word)
      }
      
      // Save called words to local storage
      localStorage.setItem(`room_${this.roomId}_calledWords`, JSON.stringify(this.calledOutWords))
      
      // Emit event to parent component
      this.$emit('call-out-word', word)
    },
    resetCalledWords() {
      this.calledOutWords = []
      localStorage.removeItem(`room_${this.roomId}_calledWords`)
      this.$emit('reset-called-words')
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

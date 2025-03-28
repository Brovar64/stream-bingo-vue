<template>
  <div :class="['player-grid-container', { 'compact-mode': compact }]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">
        {{ playerName }}'s Bingo Grid
        <span v-if="isWinner" class="ml-2 text-yellow-400">🏆 WINNER!</span>
      </h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-white">
        Close ✕
      </button>
    </div>
    
    <div class="flex justify-center">
      <div class="bingo-grid" :style="`grid-template-columns: repeat(${gridSize}, 1fr);`">
        <template v-for="row in gridSize" :key="`row-${row}`">
          <div 
            v-for="col in gridSize" 
            :key="`${row-1}_${col-1}`"
            :class="['bingo-cell', getCellClasses(`${row-1}_${col-1}`)
            ]"
          >
            <div class="bingo-cell-content">
              {{ getCellWord(`${row-1}_${col-1}`) }}
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <div class="flex justify-center mt-4">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="bg-background-lighter p-2 rounded">
          <div class="text-sm text-gray-400">Marked</div>
          <div class="text-lg font-bold">{{ stats.marked }}</div>
        </div>
        
        <div class="bg-background-lighter p-2 rounded">
          <div class="text-sm text-gray-400">Approved</div>
          <div class="text-lg font-bold">{{ stats.approved }}</div>
        </div>
        
        <div class="bg-background-lighter p-2 rounded">
          <div class="text-sm text-gray-400">Pending</div>
          <div class="text-lg font-bold">{{ stats.pending }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerGridView',
  props: {
    playerName: {
      type: String,
      required: true
    },
    playerGrid: {
      type: Object,
      required: true
    },
    gridSize: {
      type: Number,
      required: true
    },
    isWinner: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  computed: {
    stats() {
      const cells = Object.values(this.playerGrid)
      
      const marked = cells.filter(cell => cell.marked).length
      const approved = cells.filter(cell => cell.marked && cell.approved).length
      const pending = marked - approved
      
      return { marked, approved, pending }
    }
  },
  methods: {
    // Get cell classes based on state
    getCellClasses(cellKey) {
      if (!this.playerGrid[cellKey]) return ''
      
      const cell = this.playerGrid[cellKey]
      const classes = []
      
      if (cell.marked && cell.approved) {
        classes.push('marked approved')
      } else if (cell.marked) {
        classes.push('marked pending')
      }
      
      return classes.join(' ')
    },
    
    // Get cell word
    getCellWord(cellKey) {
      if (!this.playerGrid[cellKey]) return ''
      return this.playerGrid[cellKey].word
    }
  }
}
</script>

<style scoped>
.player-grid-container {
  @apply bg-background-card rounded-lg p-5 shadow-lg;
}

.player-grid-container.compact-mode {
  @apply p-3;
}

.bingo-grid {
  display: grid;
  grid-gap: 4px;
  width: 100%;
  max-width: 600px;
}

.compact-mode .bingo-grid {
  grid-gap: 2px;
}

.bingo-cell {
  aspect-ratio: 1;
  background-color: theme('colors.background.lighter');
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  padding: 8px;
  font-weight: 500;
}

.compact-mode .bingo-cell {
  padding: 4px;
  font-size: 0.7rem;
}

.bingo-cell-content {
  width: 100%;
  overflow-wrap: break-word;
  hyphens: auto;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.compact-mode .bingo-cell-content {
  -webkit-line-clamp: 2;
}

.bingo-cell.marked.approved {
  background-color: rgba(76, 175, 80, 0.2);
  border: 2px solid theme('colors.success');
}

.bingo-cell.marked.pending {
  background-color: rgba(255, 160, 0, 0.2);
  border: 2px dashed theme('colors.warning');
}

.compact-mode .stats {
  @apply text-xs;
}

.compact-mode .stats .text-lg {
  @apply text-base;
}
</style>
<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Punishment Bingo Game</h2>
    
    <div class="grid-container compact">
      <div class="grid-header">
        <div class="side-label left-label">Host Side</div>
        <div class="side-label right-label">Players Side</div>
      </div>
      
      <div class="punishment-grid" :style="`grid-template-rows: repeat(${gridHeight}, 1fr);`">
        <!-- Grid cells -->
        <template v-for="row in gridHeight" :key="`row-${row}`">
          <template v-for="col in 4" :key="`${row-1}_${col-1}`">
            <div 
              :class="['grid-cell', 
                col <= 2 ? 'creator-side' : 'player-side',
                cellContent(`${row-1}_${col-1}`) ? 'filled' : '',
                isCellCalled(`${row-1}_${col-1}`) ? 'called' : '',
                isPunishmentCompleted(`${row-1}_${col-1}`) ? 'completed' : ''
              ]"
              @click="$emit('call-out', `${row-1}_${col-1}`)"
            >
              <div v-if="cellContent(`${row-1}_${col-1}`)" class="cell-content">
                <div class="phrase">{{ cellContent(`${row-1}_${col-1}`).phrase }}</div>
                <div class="punishment">{{ cellContent(`${row-1}_${col-1}`).punishment }}</div>
                
                <!-- Vote counts -->
                <div v-if="isCellCalled(`${row-1}_${col-1}`)" class="vote-info">
                  <div class="vote-count">
                    <span class="yes">👍 {{ cellContent(`${row-1}_${col-1}`).votes?.yes || 0 }}</span>
                    <span class="no">👎 {{ cellContent(`${row-1}_${col-1}`).votes?.no || 0 }}</span>
                  </div>
                  
                  <!-- Admin resolve punishment -->
                  <div v-if="!isPunishmentCompleted(`${row-1}_${col-1}`)" class="resolve-buttons">
                    <button 
                      @click.stop="$emit('resolve-punishment', `${row-1}_${col-1}`, true)" 
                      class="resolve-btn approve"
                    >
                      ✓
                    </button>
                    <button 
                      @click.stop="$emit('resolve-punishment', `${row-1}_${col-1}`, false)" 
                      class="resolve-btn reject"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActivePunishmentGrid',
  props: {
    gridHeight: {
      type: Number,
      required: true
    },
    grid: {
      type: Object,
      required: true
    },
    calledOutCells: {
      type: Array,
      default: () => []
    },
    completedPunishments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['call-out', 'resolve-punishment'],
  methods: {
    // Get content for a specific cell
    cellContent(cellId) {
      return this.grid[cellId] || null
    },
    
    // Check if a cell is called out
    isCellCalled(cellId) {
      return this.calledOutCells.includes(cellId)
    },
    
    // Check if a punishment is completed
    isPunishmentCompleted(cellId) {
      return this.completedPunishments.includes(cellId)
    }
  }
}
</script>

<style scoped>
/* Grid Layout */
.grid-container {
  @apply relative my-6;
}

.grid-container.compact {
  @apply max-h-[calc(100vh-250px)] overflow-y-auto;
}

.grid-header {
  @apply flex mb-0;
}

.side-label {
  @apply py-2 text-center font-semibold text-sm flex-1;
}

.left-label {
  @apply bg-blue-500 bg-opacity-20 rounded-t-lg;
}

.right-label {
  @apply bg-green-500 bg-opacity-20 rounded-t-lg;
}

.punishment-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 8px;
  @apply p-4 bg-background-card rounded-lg;
}

.grid-cell {
  aspect-ratio: 1;
  min-height: 120px;
  @apply bg-background-lighter rounded p-2 relative cursor-pointer transition-colors;
}

.creator-side {
  @apply bg-blue-900 bg-opacity-10 hover:bg-blue-900 hover:bg-opacity-20;
}

.player-side {
  @apply bg-green-900 bg-opacity-10 hover:bg-green-900 hover:bg-opacity-20;
}

.grid-cell.filled {
  @apply cursor-default;
}

.grid-cell.called {
  @apply border-2;
}

.grid-cell.called.creator-side {
  @apply border-blue-500;
}

.grid-cell.called.player-side {
  @apply border-green-500;
}

.grid-cell.completed {
  @apply opacity-50;
}

.cell-content {
  @apply h-full flex flex-col justify-between;
  font-size: 0.85rem;
}

.phrase {
  @apply font-medium mb-1;
}

.punishment {
  @apply text-xs italic text-gray-400;
}

.vote-info {
  @apply mt-1 flex items-center justify-between text-xs;
}

.vote-count {
  @apply flex gap-2;
}

.yes {
  @apply text-green-400;
}

.no {
  @apply text-red-400;
}

.resolve-buttons {
  @apply flex gap-1;
}

.resolve-btn {
  @apply w-5 h-5 rounded-full flex items-center justify-center text-xs;
}

.resolve-btn.approve {
  @apply bg-success text-white;
}

.resolve-btn.reject {
  @apply bg-error text-white;
}
</style>

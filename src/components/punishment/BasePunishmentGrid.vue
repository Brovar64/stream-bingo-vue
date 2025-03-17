<template>
  <div class="card shadow-lg">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <div class="flex items-center gap-2">
        <slot name="header-actions">
          <button class="btn-icon" title="Fullscreen" @click="toggleFullscreen">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </slot>
      </div>
    </div>
    
    <div class="grid-container" :class="{'fullscreen': isFullscreen}">
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
              @click="onCellClick(`${row-1}_${col-1}`)"
            >
              <div v-if="cellContent(`${row-1}_${col-1}`)">
                <div class="cell-content">
                  <div class="phrase">{{ cellContent(`${row-1}_${col-1}`).phrase }}</div>
                  
                  <div class="punishment-box">
                    <div class="punishment-label">Punishment:</div>
                    <div class="punishment">{{ cellContent(`${row-1}_${col-1}`).punishment }}</div>
                  </div>
                  
                  <!-- Slot for cell content (voting UI or admin buttons) -->
                  <slot 
                    name="cell-actions" 
                    :cell-id="`${row-1}_${col-1}`" 
                    :cell="cellContent(`${row-1}_${col-1}`)"
                    :is-called="isCellCalled(`${row-1}_${col-1}`)"
                    :is-completed="isPunishmentCompleted(`${row-1}_${col-1}`)"
                  ></slot>
                  
                  <!-- Completed badge -->
                  <div v-if="isPunishmentCompleted(`${row-1}_${col-1}`)">
                    <slot name="completed-badge" :cell-id="`${row-1}_${col-1}`">
                      <div class="completed-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>COMPLETED</span>
                      </div>
                    </slot>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
      
      <!-- Legend/Key when in fullscreen mode -->
      <div v-if="isFullscreen" class="grid-legend">
        <div class="legend-item">
          <div class="legend-color creator-legend"></div>
          <span class="legend-text">Host Punishments</span>
        </div>
        <div class="legend-item">
          <div class="legend-color player-legend"></div>
          <span class="legend-text">Player Punishments</span>
        </div>
        <div class="legend-item">
          <div class="legend-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <span class="legend-text">Completed Punishment</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasePunishmentGrid',
  props: {
    title: {
      type: String,
      default: 'Punishment Bingo'
    },
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
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isFullscreen: false
    }
  },
  emits: ['cell-click'],
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
    },
    
    // Toggle fullscreen mode
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      
      // Toggle body class for global styling
      if (this.isFullscreen) {
        document.body.classList.add('grid-fullscreen-active')
      } else {
        document.body.classList.remove('grid-fullscreen-active')
      }
    },
    
    // Handle cell click
    onCellClick(cellId) {
      if (!this.readonly && this.cellContent(cellId)) {
        this.$emit('cell-click', cellId)
      }
    }
  }
}
</script>

<style scoped>
/* Grid Layout */
.grid-container {
  @apply relative rounded-lg bg-background-card transition-all duration-300 ease-in-out;
  height: calc(100vh - 300px);
  max-height: 700px;
  display: flex;
  flex-direction: column;
}

.grid-container.fullscreen {
  @apply fixed inset-0 z-50 bg-background-dark bg-opacity-95 p-4;
  height: 100vh;
  max-height: 100vh;
}

.grid-header {
  @apply flex mb-0 sticky top-0 z-10;
}

.side-label {
  @apply py-3 text-center font-bold text-base flex-1 transition-all duration-300;
}

.left-label {
  @apply bg-blue-600 bg-opacity-20 rounded-t-lg text-blue-300;
}

.right-label {
  @apply bg-green-600 bg-opacity-20 rounded-t-lg text-green-300;
}

.punishment-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 8px;
  @apply p-4 bg-background-card rounded-lg flex-1 overflow-y-auto;
}

.grid-cell {
  aspect-ratio: 1;
  @apply bg-background-lighter rounded-lg p-0 relative transition-all duration-200 shadow-md overflow-hidden flex items-center justify-center;
  min-height: 140px;
}

.creator-side {
  @apply bg-blue-900 bg-opacity-10;
}

.player-side {
  @apply bg-green-900 bg-opacity-10;
}

.grid-cell:not(.readonly) {
  @apply cursor-pointer;
}

.grid-cell:not(.readonly).creator-side:hover {
  @apply bg-blue-900 bg-opacity-20;
}

.grid-cell:not(.readonly).player-side:hover {
  @apply bg-green-900 bg-opacity-20;
}

.grid-cell.filled {
  @apply cursor-default;
}

.cell-content {
  @apply h-full w-full flex flex-col p-3 relative;
}

.phrase {
  @apply font-semibold mb-1 text-sm flex-grow flex items-center justify-center text-center px-1;
}

.punishment-box {
  @apply mt-2 p-2 rounded-lg bg-background-card bg-opacity-50;
}

.punishment-label {
  @apply text-[0.65rem] uppercase font-bold text-gray-400;
}

.punishment {
  @apply text-xs italic text-gray-300;
}

.grid-cell.called {
  @apply border-[3px] shadow-lg transform scale-[1.02];
}

.grid-cell.called.creator-side {
  @apply border-blue-500;
}

.grid-cell.called.player-side {
  @apply border-green-500;
}

.grid-cell.completed {
  @apply opacity-80 grayscale;
}

.completed-badge {
  @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-success bg-opacity-90 text-white px-3 py-1 rounded-full flex items-center justify-center gap-1 font-bold;
  font-size: 0.7rem;
}

.btn-icon {
  @apply p-2 rounded-full bg-background-lighter hover:bg-background-card transition-colors;
}

/* Legend styles */
.grid-legend {
  @apply flex justify-center items-center gap-6 py-3 bg-background-card rounded-lg mt-3;
}

.legend-item {
  @apply flex items-center gap-2;
}

.legend-color {
  @apply w-4 h-4 rounded;
}

.creator-legend {
  @apply bg-blue-500 bg-opacity-30 border border-blue-500;
}

.player-legend {
  @apply bg-green-500 bg-opacity-30 border border-green-500;
}

.legend-badge {
  @apply bg-success text-white w-4 h-4 rounded-full flex items-center justify-center;
}

.legend-text {
  @apply text-xs text-gray-300;
}

/* Media queries for responsive layout */
@media (max-width: 768px) {
  .grid-container {
    height: calc(100vh - 250px);
  }
  
  .grid-cell {
    min-height: 100px;
  }
  
  .phrase {
    font-size: 0.75rem;
  }
  
  .punishment {
    font-size: 0.65rem;
  }
}

/* Fullscreen styles for mobile */
@media (max-width: 640px) {
  .grid-container.fullscreen .punishment-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 8px;
  }
  
  .grid-container.fullscreen .grid-cell {
    min-height: 120px;
  }
  
  .grid-legend {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 16px;
    gap: 2px;
  }
}
</style>
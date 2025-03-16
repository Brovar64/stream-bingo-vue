<template>
  <div class="grid-editor">
    <h3 class="text-lg font-semibold mb-3">Edit Grid</h3>
    
    <div class="grid-container">
      <div class="grid-header">
        <div class="side-label left-label">Room Creator Side</div>
        <div class="side-label right-label">Players Side</div>
      </div>
      
      <div class="punishment-grid" :style="`grid-template-rows: repeat(${gridHeight}, 1fr);`">
        <!-- Grid cells -->
        <template v-for="row in gridHeight" :key="`row-${row}`">
          <template v-for="col in 4" :key="`${row-1}_${col-1}`">
            <div 
              :class="['grid-cell', 
                col <= 2 ? 'creator-side' : 'player-side',
                cellContent(`${row-1}_${col-1}`) ? 'filled' : ''
              ]"
              @click="editCell(row-1, col-1, col <= 2 ? 'left' : 'right')"
            >
              <div v-if="cellContent(`${row-1}_${col-1}`)" class="cell-content">
                <div class="phrase">{{ cellContent(`${row-1}_${col-1}`).phrase }}</div>
                <div class="punishment">{{ cellContent(`${row-1}_${col-1}`).punishment }}</div>
                <button @click.stop="$emit('remove-cell', `${row-1}_${col-1}`)" class="remove-btn">×</button>
              </div>
              <div v-else class="empty-cell">
                <span>Click to add</span>
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
  name: 'PunishmentGridEditor',
  props: {
    gridHeight: {
      type: Number,
      required: true
    },
    grid: {
      type: Object,
      required: true
    }
  },
  emits: ['edit-cell', 'remove-cell'],
  methods: {
    // Get content for a specific cell
    cellContent(cellId) {
      return this.grid[cellId] || null
    },
    
    // Edit a cell
    editCell(row, col, side) {
      this.$emit('edit-cell', { row, col, side })
    }
  }
}
</script>

<style scoped>
/* Grid Layout */
.grid-container {
  @apply relative my-6;
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
  @apply p-4 bg-background-card rounded-b-lg;
}

.grid-cell {
  aspect-ratio: 1;
  min-height: 120px;
  max-height: 150px;
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

.empty-cell {
  @apply h-full flex items-center justify-center text-xs text-gray-500;
}

.remove-btn {
  @apply absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-error text-white opacity-0 transition-opacity;
}

.grid-cell:hover .remove-btn {
  @apply opacity-100;
}
</style>

<template>
  <div class="card">
    <div class="grid-container active-mode">
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
            >
              <div v-if="cellContent(`${row-1}_${col-1}`)" class="cell-content">
                <div class="phrase">{{ cellContent(`${row-1}_${col-1}`).phrase }}</div>
                <div class="punishment">{{ cellContent(`${row-1}_${col-1}`).punishment }}</div>
                
                <!-- Voting UI -->
                <PunishmentVotingUI
                  v-if="isCellCalled(`${row-1}_${col-1}`) && !isPunishmentCompleted(`${row-1}_${col-1}`)"
                  :votes="cellContent(`${row-1}_${col-1}`).votes || { yes: 0, no: 0 }"
                  :user-voted="getUserVote(`${row-1}_${col-1}`)"
                  @vote="(vote) => $emit('vote', `${row-1}_${col-1}`, vote)"
                />
                
                <!-- Completed indicator -->
                <div v-if="isPunishmentCompleted(`${row-1}_${col-1}`)" class="completed-indicator">
                  ✓ Punishment completed
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
import PunishmentVotingUI from '@/components/punishment/PunishmentVotingUI.vue'

export default {
  name: 'PunishmentPlayerGrid',
  components: {
    PunishmentVotingUI
  },
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
    },
    punishmentVotes: {
      type: Object,
      default: () => ({})
    },
    username: {
      type: String,
      required: true
    }
  },
  emits: ['vote'],
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
    
    // Get user's vote for a particular cell
    getUserVote(cellId) {
      const voteKey = `${cellId}_${this.username}`
      return this.punishmentVotes[voteKey] || null
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
  @apply p-4 bg-background-card rounded-lg;
}

.grid-cell {
  aspect-ratio: 1;
  min-height: 120px;
  @apply bg-background-lighter rounded p-2 relative transition-colors;
}

.creator-side {
  @apply bg-blue-900 bg-opacity-10;
}

.player-side {
  @apply bg-green-900 bg-opacity-10;
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

.completed-indicator {
  @apply mt-2 text-xs text-center text-success;
}
</style>

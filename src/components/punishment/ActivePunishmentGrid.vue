<template>
  <BasePunishmentGrid
    title="Punishment Bingo Game"
    :grid-height="gridHeight"
    :grid="grid"
    :called-out-cells="calledOutCells"
    :completed-punishments="completedPunishments"
    @cell-click="$emit('call-out', $event)"
  >
    <template #cell-actions="{ cellId, cell, isCalled, isCompleted }">
      <!-- Vote counts -->
      <div v-if="isCalled">
        <div class="vote-info">
          <div class="vote-count">
            <span class="yes">👍 {{ cell.votes?.yes || 0 }}</span>
            <span class="no">👎 {{ cell.votes?.no || 0 }}</span>
          </div>
          
          <!-- Admin resolve punishment -->
          <div v-if="!isCompleted" class="resolve-buttons">
            <button 
              @click.stop="$emit('resolve-punishment', cellId, true)" 
              class="resolve-btn approve"
            >
              ✓
            </button>
            <button 
              @click.stop="$emit('resolve-punishment', cellId, false)" 
              class="resolve-btn reject"
            >
              ✗
            </button>
          </div>
        </div>
      </div>
    </template>
  </BasePunishmentGrid>
</template>

<script>
import BasePunishmentGrid from './BasePunishmentGrid.vue'

export default {
  name: 'ActivePunishmentGrid',
  components: {
    BasePunishmentGrid
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
    }
  },
  emits: ['call-out', 'resolve-punishment']
}
</script>

<style scoped>
.vote-info {
  @apply mt-2 p-1 rounded-lg bg-background-dark bg-opacity-40 flex items-center justify-between text-xs;
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
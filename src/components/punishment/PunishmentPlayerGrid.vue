<template>
  <BasePunishmentGrid
    title="Punishment Bingo"
    :grid-height="gridHeight"
    :grid="grid"
    :called-out-cells="calledOutCells"
    :completed-punishments="completedPunishments"
    :readonly="true"
  >
    <template #cell-actions="{ cellId, isCompleted, isCalled }">
      <!-- Voting UI -->
      <div v-if="isCalled && !isCompleted" class="voting-container">
        <PunishmentVotingUI
          :votes="cellContent(cellId).votes || { yes: 0, no: 0 }"
          :user-voted="getUserVote(cellId)"
          @vote="(vote) => $emit('vote', cellId, vote)"
        />
      </div>
    </template>
  </BasePunishmentGrid>
</template>

<script>
import BasePunishmentGrid from './BasePunishmentGrid.vue'
import PunishmentVotingUI from './PunishmentVotingUI.vue'

export default {
  name: 'PunishmentPlayerGrid',
  components: {
    BasePunishmentGrid,
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
    
    // Get user's vote for a particular cell
    getUserVote(cellId) {
      const voteKey = `${cellId}_${this.username}`
      return this.punishmentVotes[voteKey] || null
    }
  }
}
</script>

<style scoped>
.voting-container {
  @apply mt-2 p-1 rounded-lg bg-background-dark bg-opacity-40;
}
</style>
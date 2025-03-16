<template>
  <div v-if="winners && winners.length > 0" class="card mb-6">
    <h2 class="text-xl font-semibold mb-4">Bingo Winners</h2>
    <div class="space-y-2">
      <div
          v-for="(winner, index) in winners"
          :key="index"
          class="bg-background-lighter p-3 rounded-lg flex justify-between items-center"
      >
        <div class="flex items-center">
          <span class="text-yellow-400 text-2xl mr-3">🏆</span>
          <span class="font-medium">{{ winner }}</span>
        </div>
        <button
            @click="togglePlayerGrid(winner)"
            class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1 px-2"
        >
          {{ isPlayerSelected(winner) ? 'Hide Grid' : 'View Grid' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WinnersPanel',
  props: {
    winners: {
      type: Array,
      required: true
    },
    selectedPlayer: {
      type: String,
      default: null
    }
  },
  emits: ['player-selected'],
  methods: {
    isPlayerSelected(playerName) {
      return this.selectedPlayer === playerName
    },
    togglePlayerGrid(playerName) {
      const newSelected = this.selectedPlayer === playerName ? null : playerName
      this.$emit('player-selected', newSelected)
    }
  }
}
</script>

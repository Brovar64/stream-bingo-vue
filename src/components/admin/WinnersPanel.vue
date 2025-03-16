<template>
  <BaseCard v-if="winners && winners.length > 0" class="mb-6">
    <template #header>
      <h2 class="text-xl font-semibold">Bingo Winners</h2>
    </template>
    
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
  </BaseCard>
</template>

<script>
import BaseCard from '@/components/base/BaseCard.vue';

export default {
  name: 'WinnersPanel',
  components: {
    BaseCard
  },
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

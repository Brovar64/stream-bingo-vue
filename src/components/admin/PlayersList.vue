<template>
  <BaseCard>
    <template #header>
      <h2 class="text-xl font-semibold">Players</h2>
    </template>
    
    <div v-if="!players || players.length === 0" class="text-center py-4 text-gray-400">
      No players have joined yet.
    </div>
    
    <div v-else class="space-y-2">
      <div
        v-for="(player, index) in players"
        :key="index"
        :class="['player-item',
               isPlayerSelected(player.nickname) ? 'selected' : '',
               isPlayerWinner(player.nickname) ? 'winner' : '']"
      >
        <div class="player-header" @click="togglePlayerGrid(player.nickname)">
          <div>
            <div class="flex items-center">
              <span class="font-medium">{{ player.nickname }}</span>
              <span v-if="isPlayerWinner(player.nickname)" class="ml-2 text-yellow-400">🏆 BINGO!</span>
            </div>
            <div class="text-xs text-gray-400 mt-1">
              <span v-if="getPlayerStats(player.nickname)">
                {{ getPlayerStats(player.nickname).approved }} / {{ totalCells }} words marked
              </span>
              <span v-else>Joined: {{ formatTime(player.joinedAt) }}</span>
            </div>
          </div>
          <div class="player-expand-icon">
            {{ isPlayerSelected(player.nickname) ? '▼' : '▶' }}
          </div>
        </div>

        <!-- Inline Player Grid -->
        <PlayerGridView
          v-if="isPlayerSelected(player.nickname) && playerGrids && playerGrids[player.nickname]"
          :playerName="player.nickname"
          :gridSize="gridSize"
          :playerGrid="playerGrids[player.nickname]"
          :isWinner="isPlayerWinner(player.nickname)"
          :compact="true"
          @close="$emit('player-selected', null)"
          class="player-grid-view"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script>
import PlayerGridView from '@/components/bingo/PlayerGridView.vue';
import BaseCard from '@/components/base/BaseCard.vue';

export default {
  name: 'PlayersList',
  components: {
    PlayerGridView,
    BaseCard
  },
  props: {
    players: {
      type: Array,
      required: true
    },
    playerGrids: {
      type: Object,
      required: true
    },
    winners: {
      type: Array,
      required: true
    },
    selectedPlayer: {
      type: String,
      default: null
    },
    gridSize: {
      type: Number,
      required: true
    }
  },
  emits: ['player-selected'],
  computed: {
    totalCells() {
      return this.gridSize * this.gridSize
    }
  },
  methods: {
    isPlayerWinner(playerName) {
      return this.winners.includes(playerName)
    },
    isPlayerSelected(playerName) {
      return this.selectedPlayer === playerName
    },
    togglePlayerGrid(playerName) {
      const newSelected = this.selectedPlayer === playerName ? null : playerName
      this.$emit('player-selected', newSelected)
    },
    getPlayerStats(playerName) {
      if (!this.playerGrids?.[playerName]) return null

      const grid = this.playerGrids[playerName]
      const cells = Object.values(grid)

      const marked = cells.filter(cell => cell.marked).length
      const approved = cells.filter(cell => cell.marked && cell.approved).length
      const pending = marked - approved

      return { marked, approved, pending }
    },
    formatTime(timestamp) {
      if (!timestamp) return 'Unknown'

      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString()
    }
  }
}
</script>

<style scoped>
/* Player list styling */
.player-item {
  @apply bg-background-lighter rounded-lg mb-2 overflow-hidden transition-all duration-200;
}

.player-item.selected {
  @apply bg-primary bg-opacity-20;
}

.player-item.winner {
  @apply border-2 border-yellow-400;
}

.player-header {
  @apply flex justify-between items-center p-3 cursor-pointer;
}

.player-expand-icon {
  @apply text-primary transition-transform duration-200;
}

.player-grid-view {
  @apply border-t border-gray-700 pt-2;
}
</style>

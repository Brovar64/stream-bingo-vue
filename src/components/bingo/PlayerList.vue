<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Players</h2>
    <div v-if="!players || players.length === 0" class="text-center py-4 text-gray-400">
      No players have joined yet.
    </div>
    <div v-else class="space-y-2">
      <div 
        v-for="(player, index) in players" 
        :key="index"
        :class="['flex justify-between items-center p-3 rounded', 
                  selectedPlayer === player.nickname ? 'bg-primary bg-opacity-20' : 'bg-background-lighter',
                  isPlayerWinner(player.nickname) ? 'border-2 border-yellow-400' : '']"
      >
        <div>
          <div class="flex items-center">
            <span class="font-medium">{{ player.nickname }}</span>
            <span v-if="isPlayerWinner(player.nickname)" class="ml-2 text-yellow-400">🏆 BINGO!</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">
            <span v-if="getPlayerStats(player.nickname)">
              {{ getPlayerStats(player.nickname).approved }} / {{ gridSize * gridSize }} words marked
            </span>
            <span v-else>Joined: {{ formatTime(player.joinedAt) }}</span>
          </div>
        </div>
        <button 
          @click="$emit('view-player', player.nickname)"
          :class="['btn py-1 px-2 text-sm', 
                  selectedPlayer === player.nickname ? 'bg-primary-dark' : 'bg-primary']"
        >
          View Grid
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerList',
  props: {
    players: {
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
    },
    winners: {
      type: Array,
      default: () => []
    },
    playerGrids: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['view-player'],
  methods: {
    // Check if player has won
    isPlayerWinner(playerName) {
      return this.winners.includes(playerName)
    },
    
    // Get player stats (marked cells, approved cells, pending cells)
    getPlayerStats(playerName) {
      if (!this.playerGrids[playerName]) return null
      
      const grid = this.playerGrids[playerName]
      const cells = Object.values(grid)
      
      const marked = cells.filter(cell => cell.marked).length
      const approved = cells.filter(cell => cell.marked && cell.approved).length
      const pending = marked - approved
      
      return { marked, approved, pending }
    },
    
    // Format timestamp
    formatTime(timestamp) {
      if (!timestamp) return 'Unknown'
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString()
    }
  }
}
</script>

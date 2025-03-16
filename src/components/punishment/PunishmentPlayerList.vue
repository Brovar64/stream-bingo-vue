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
        class="bg-background-lighter p-3 rounded-lg"
      >
        <div class="font-medium">{{ player.nickname }}</div>
        <div class="text-xs text-gray-400 mt-1">
          Joined: {{ formatTime(player.joinedAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PunishmentPlayerList',
  props: {
    players: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // Format timestamp
    formatTime(timestamp) {
      if (!timestamp) return 'Unknown'
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString()
    }
  }
}
</script>

<style scoped>
/* You can add component-specific styles here if needed */
</style>

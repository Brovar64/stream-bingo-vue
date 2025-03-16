<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="card p-4">
      <h3 class="text-gray-400 text-sm mb-1">Players</h3>
      <div class="text-2xl font-bold">{{ playersCount }}</div>
    </div>
    <div class="card p-4">
      <h3 class="text-gray-400 text-sm mb-1">Pending Approvals</h3>
      <div class="text-2xl font-bold">{{ pendingApprovalsCount }}</div>
    </div>
    <div class="card p-4">
      <h3 class="text-gray-400 text-sm mb-1">Bingo Winners</h3>
      <div class="text-2xl font-bold">{{ winnersCount }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameStats',
  props: {
    playersCount: {
      type: Number,
      default: 0
    },
    pendingApprovalsCount: {
      type: Number,
      default: 0
    },
    winnersCount: {
      type: Number,
      default: 0
    }
  }
}
</script>

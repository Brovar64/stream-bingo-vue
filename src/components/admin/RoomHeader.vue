<template>
  <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
    <div>
      <div class="flex items-center gap-3 mb-2">
        <h1 class="title">Room: {{ roomData.id }}</h1>
        <span
            :class="['status-badge', roomData.status === 'active' ? 'bg-success' : 'bg-warning']"
        >
          {{ roomData.status === 'active' ? 'Active' : 'Setup' }}
        </span>
      </div>
      <p class="subtitle">{{ roomData.gridSize }}x{{ roomData.gridSize }} Grid</p>
    </div>

    <div class="flex flex-wrap gap-3 mt-4 md:mt-0 items-center">
      <!-- Room Code Display when room is active -->
      <div v-if="isRoomActive" class="flex items-center bg-background-lighter px-3 py-2 rounded mr-3">
        <div class="mr-3">
          <div class="text-xs text-gray-400">Room Code:</div>
          <div class="font-bold text-primary">{{ roomData.id }}</div>
        </div>
        <button
            @click="copyRoomCode"
            class="btn bg-background-card hover:bg-gray-700 text-white text-sm py-1 px-2"
            title="Copy room code to clipboard"
        >
          Copy
        </button>
      </div>

      <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
        Back to Dashboard
      </router-link>

      <button
          v-if="isRoomSetup"
          @click="startGame"
          :disabled="wordCount < requiredWords"
          :class="['btn', wordCount < requiredWords ? 'bg-gray-600 cursor-not-allowed' : 'btn-primary']"
      >
        Start Game
      </button>

      <button
          v-if="isRoomActive"
          @click="resetGame"
          class="btn bg-warning hover:bg-yellow-700 text-white"
      >
        Reset Game
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoomHeader',
  props: {
    roomData: {
      type: Object,
      required: true
    },
    isRoomActive: {
      type: Boolean,
      required: true
    },
    isRoomSetup: {
      type: Boolean,
      required: true
    },
    wordCount: {
      type: Number,
      required: true
    },
    requiredWords: {
      type: Number,
      required: true
    }
  },
  emits: ['start-game', 'reset-game', 'copy-room-code'],
  methods: {
    startGame() {
      this.$emit('start-game')
    },
    resetGame() {
      this.$emit('reset-game')
    },
    copyRoomCode() {
      this.$emit('copy-room-code', this.roomData.id)
    }
  }
}
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}
</style>

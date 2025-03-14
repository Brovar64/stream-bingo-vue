<template>
  <div class="card mt-6 bg-background-lighter">
    <div class="text-center">
      <h2 class="text-xl font-semibold mb-2">Share Room Code</h2>
      <p class="text-gray-400 mb-4">Give this code to your viewers so they can join</p>
      <div class="text-3xl font-bold text-primary tracking-widest my-4">{{ roomCode }}</div>
      <button 
        @click="copyToClipboard" 
        class="btn bg-background-card hover:bg-gray-700 text-white"
      >
        Copy to Clipboard
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoomCodeDisplay',
  props: {
    roomCode: {
      type: String,
      required: true
    }
  },
  methods: {
    // Copy room code to clipboard
    copyToClipboard() {
      navigator.clipboard.writeText(this.roomCode)
        .then(() => {
          this.$emit('copied', 'Room code copied to clipboard')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
          this.$emit('error', 'Failed to copy room code')
        })
    }
  }
}
</script>

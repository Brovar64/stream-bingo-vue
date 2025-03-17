<template>
  <div class="text-center py-16">
    <h2 class="text-2xl font-semibold mb-2">Waiting for Game to Start</h2>
    <p class="text-gray-400 mb-8">The host is setting up the game. Please wait.</p>
    
    <div class="waiting-animation">
      <div class="dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <p class="text-gray-400">Room Status: {{ roomStatus }}</p>
    </div>
    
    <div class="mt-12">
      <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WaitingGameState',
  props: {
    roomStatus: {
      type: String,
      default: 'setup'
    }
  }
}
</script>

<style scoped>
.waiting-animation {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dots {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  background-color: #FF4081;
  border-radius: 50%;
  animation: dot-pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
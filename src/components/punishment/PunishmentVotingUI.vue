<template>
  <div class="vote-ui">
    <div class="vote-count">
      <div class="vote-stats">
        <span class="yes-count">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          {{ votes.yes || 0 }}
        </span>
        <span class="no-count">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
          </svg>
          {{ votes.no || 0 }}
        </span>
      </div>
      
      <div v-if="userVoted" class="vote-status">
        You voted: <span :class="userVoted === 'yes' ? 'text-green-400' : 'text-red-400'">{{ userVoted === 'yes' ? 'Completed' : 'Not Done' }}</span>
      </div>
    </div>
    
    <div class="vote-buttons">
      <button 
        @click.stop="$emit('vote', 'yes')" 
        :class="['vote-btn yes', userVoted === 'yes' ? 'voted' : '']"
        title="Vote that punishment was completed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
        Completed
      </button>
      <button 
        @click.stop="$emit('vote', 'no')" 
        :class="['vote-btn no', userVoted === 'no' ? 'voted' : '']"
        title="Vote that punishment was not completed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
        </svg>
        Not Done
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PunishmentVotingUI',
  props: {
    votes: {
      type: Object,
      default: () => ({ yes: 0, no: 0 })
    },
    userVoted: {
      type: String,
      default: null
    }
  },
  emits: ['vote']
}
</script>

<style scoped>
.vote-ui {
  @apply flex flex-col text-xs;
}

.vote-count {
  @apply flex flex-col items-center mb-2 pb-2 border-b border-gray-700;
}

.vote-stats {
  @apply flex justify-center gap-4 mb-1;
}

.yes-count, .no-count {
  @apply flex items-center gap-1;
}

.yes-count {
  @apply text-green-400;
}

.no-count {
  @apply text-red-400;
}

.vote-status {
  @apply text-gray-400 text-[0.65rem] italic;
}

.vote-buttons {
  @apply flex gap-2 justify-center;
}

.vote-btn {
  @apply px-2 py-1 rounded text-xs border flex items-center gap-1 transition-all duration-200 transform hover:scale-105;
}

.vote-btn.yes {
  @apply border-green-500 text-green-400 hover:bg-green-900 hover:bg-opacity-20;
}

.vote-btn.yes.voted {
  @apply bg-green-500 bg-opacity-20 font-bold;
}

.vote-btn.no {
  @apply border-red-500 text-red-400 hover:bg-red-900 hover:bg-opacity-20;
}

.vote-btn.no.voted {
  @apply bg-red-500 bg-opacity-20 font-bold;
}
</style>
<template>
  <div class="vote-ui">
    <div class="vote-count mb-1">
      <span class="yes">👍 {{ votes.yes || 0 }}</span>
      <span class="no">👎 {{ votes.no || 0 }}</span>
    </div>
    
    <div class="vote-buttons">
      <button 
        @click.stop="$emit('vote', 'yes')" 
        :class="['vote-btn yes', userVoted === 'yes' ? 'voted' : '']"
        title="Vote that punishment was completed"
      >
        Completed
      </button>
      <button 
        @click.stop="$emit('vote', 'no')" 
        :class="['vote-btn no', userVoted === 'no' ? 'voted' : '']"
        title="Vote that punishment was not completed"
      >
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
  @apply mt-2 flex flex-col text-xs;
}

.vote-count {
  @apply flex justify-center gap-4;
}

.yes {
  @apply text-green-400;
}

.no {
  @apply text-red-400;
}

.vote-buttons {
  @apply flex gap-1 justify-center;
}

.vote-btn {
  @apply px-2 py-1 rounded text-xs border;
}

.vote-btn.yes {
  @apply border-green-500 text-green-400;
}

.vote-btn.yes.voted {
  @apply bg-green-500 bg-opacity-20 font-bold;
}

.vote-btn.no {
  @apply border-red-500 text-red-400;
}

.vote-btn.no.voted {
  @apply bg-red-500 bg-opacity-20 font-bold;
}
</style>

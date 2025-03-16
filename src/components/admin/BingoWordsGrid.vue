<template>
  <div class="card mb-6">
    <h2 class="text-xl font-semibold mb-4">Bingo Words</h2>
    <p class="text-sm text-gray-400 mb-4">
      Click on a word to mark it as called out for all players.
    </p>

    <!-- Search and Sort Controls -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="flex-grow">
        <input
            type="text"
            v-model="searchQuery"
            class="form-control w-full"
            placeholder="Search words..."
            @input="$emit('search-change', searchQuery)"
        />
      </div>
      <div class="flex gap-2">
        <button
            @click="handleSortClick('alphabetical')"
            class="btn bg-background-lighter hover:bg-gray-700 text-white text-sm py-1 px-2"
            :class="{ 'bg-primary': sortBy === 'alphabetical' }"
        >
          Sort A-Z
          <span v-if="sortBy === 'alphabetical'">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
        <button
            @click="handleSortClick('calledOut')"
            class="btn bg-background-lighter hover:bg-gray-700 text-white text-sm py-1 px-2"
            :class="{ 'bg-primary': sortBy === 'calledOut' }"
        >
          Sort by Status
          <span v-if="sortBy === 'calledOut'">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1">
      <div
          v-for="(word, index) in words"
          :key="index"
          :class="['bingo-word-card', {
          'called-out': isWordCalledOut(word),
          'has-approvals': hasPendingApprovals(word)
        }]"
          @click="toggleWordCalledOut(word)"
      >
        <div class="bingo-word-content">{{ word }}</div>

        <div class="bingo-word-status">
          <span v-if="isWordCalledOut(word)" class="called-out-icon">✓</span>
        </div>

        <!-- Approval indicators -->
        <div v-if="hasPendingApprovals(word)" class="approval-indicators">
          <div
              v-for="(approval, approvalIndex) in getApprovalsForWord(word)"
              :key="approvalIndex"
              class="approval-badge"
              :title="`${approval.playerName} marked this word`"
          >
            {{ getInitial(approval.playerName) }}
            <div class="approval-actions">
              <button
                  @click.stop="approveWord(approval)"
                  class="approve-btn"
                  title="Approve"
              >✓</button>
              <button
                  @click.stop="rejectWord(approval)"
                  class="reject-btn"
                  title="Reject"
              >✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between text-sm text-gray-400 mt-4">
      <span>{{ calledOutWordsCount }} / {{ totalWords }} words called</span>
      <span>Showing {{ words.length }} of {{ totalWords }} words</span>
      <button
          @click="resetCalledWords"
          class="text-primary hover:text-primary-light"
      >
        Reset Called Words
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BingoWordsGrid',
  props: {
    words: {
      type: Array,
      required: true
    },
    calledOutWords: {
      type: Array,
      required: true
    },
    pendingApprovals: {
      type: Array,
      required: true
    },
    totalWords: {
      type: Number,
      required: true
    },
    sortBy: {
      type: String,
      required: true
    },
    sortOrder: {
      type: String,
      required: true
    }
  },
  emits: [
    'toggle-word-called-out', 
    'reset-called-words', 
    'approve-word', 
    'reject-word', 
    'sort-change',
    'search-change'
  ],
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    calledOutWordsCount() {
      return this.calledOutWords.length
    }
  },
  methods: {
    toggleWordCalledOut(word) {
      this.$emit('toggle-word-called-out', word)
    },
    resetCalledWords() {
      this.$emit('reset-called-words')
    },
    isWordCalledOut(word) {
      return this.calledOutWords.includes(word)
    },
    hasPendingApprovals(word) {
      return this.getApprovalsForWord(word).length > 0
    },
    getApprovalsForWord(word) {
      return this.pendingApprovals.filter(approval => approval.word === word)
    },
    getInitial(playerName) {
      return playerName ? playerName.charAt(0).toUpperCase() : '?'
    },
    approveWord(approval) {
      this.$emit('approve-word', approval)
    },
    rejectWord(approval) {
      this.$emit('reject-word', approval)
    },
    handleSortClick(sortType) {
      const newSortOrder = this.sortBy === sortType 
        ? (this.sortOrder === 'asc' ? 'desc' : 'asc') 
        : 'asc'
      
      this.$emit('sort-change', { 
        sortBy: sortType, 
        sortOrder: newSortOrder 
      })
    }
  }
}
</script>

<style scoped>
/* Bingo word card styling */
.bingo-word-card {
  @apply relative bg-background-lighter p-3 rounded flex flex-col min-h-[80px] transition-colors;
  display: flex;
  align-items: flex-start;
}

.bingo-word-card.called-out {
  @apply bg-success bg-opacity-20 border border-success;
}

.bingo-word-card.has-approvals {
  @apply bg-warning bg-opacity-10 border border-warning;
}

.bingo-word-content {
  @apply break-words overflow-hidden w-full text-sm;
  word-break: break-word;
  max-height: 100%;
}

.bingo-word-status {
  @apply absolute top-2 right-2;
}

.called-out-icon {
  @apply text-success font-bold;
}

/* Approval indicators */
.approval-indicators {
  @apply flex flex-wrap gap-1 mt-2 w-full;
}

.approval-badge {
  @apply flex items-center justify-center bg-warning text-black w-6 h-6 rounded-full text-xs font-bold relative;
}

.approval-badge:hover .approval-actions {
  @apply flex;
}

.approval-actions {
  @apply hidden absolute -top-7 left-0 bg-background-card rounded-lg shadow-lg p-1 border border-gray-600 z-10;
}

.approve-btn, .reject-btn {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-xs;
}

.approve-btn {
  @apply bg-success text-white mr-1;
}

.reject-btn {
  @apply bg-error text-white;
}
</style>

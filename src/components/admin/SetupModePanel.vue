<template>
  <div class="card mb-6">
    <h2 class="text-xl font-semibold mb-4">Add Bingo Words</h2>
    <p class="text-sm text-gray-400 mb-4">
      Add words or phrases that might happen during your stream.
      <span class="text-warning">
        You need {{ requiredWords }} words for a {{ gridSize }}x{{ gridSize }} grid.
      </span>
    </p>

    <div class="mb-4">
      <div class="progress-bar">
        <div
            class="progress"
            :style="`width: ${(wordCount / requiredWords) * 100}%`"
        ></div>
      </div>
      <div class="text-sm text-gray-400 mt-1">
        {{ wordCount }} / {{ requiredWords }} words added
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mb-4">
      <button
          @click="openImportModal"
          class="btn bg-background-lighter hover:bg-gray-700 text-white"
          :disabled="noWordSets"
      >
        Import Words
      </button>

      <button
          @click="openPasteModal"
          class="btn bg-background-lighter hover:bg-gray-700 text-white"
      >
        Paste Multiple Words
      </button>
    </div>

    <form @submit.prevent="addWord" class="mb-4">
      <div class="flex">
        <input
            type="text"
            v-model="wordInput"
            class="form-control flex-grow"
            placeholder="Enter a word or phrase"
            required
        >
        <button
            type="submit"
            class="btn btn-primary ml-2"
            :disabled="!wordInput.trim()"
        >
          Add
        </button>
      </div>
    </form>

    <!-- Word list in 3 columns -->
    <div class="word-list">
      <div v-if="wordCount === 0" class="text-center text-gray-400 py-4">
        No words added yet.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div
            v-for="(word, index) in words"
            :key="index"
            class="flex justify-between items-center bg-background-lighter p-2 rounded"
        >
          <span class="overflow-hidden text-ellipsis">{{ word }}</span>
          <button
              @click="removeWord(index)"
              class="text-error hover:text-red-300 transition-colors ml-2 flex-shrink-0"
              title="Remove word"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupModePanel',
  props: {
    words: {
      type: Array,
      required: true
    },
    requiredWords: {
      type: Number,
      required: true
    },
    gridSize: {
      type: Number,
      required: true
    },
    noWordSets: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-word', 'remove-word', 'open-import-modal', 'open-paste-modal'],
  data() {
    return {
      wordInput: ''
    }
  },
  computed: {
    wordCount() {
      return this.words.length
    }
  },
  methods: {
    addWord() {
      if (!this.wordInput.trim()) return
      this.$emit('add-word', this.wordInput.trim())
      this.wordInput = ''
    },
    removeWord(index) {
      this.$emit('remove-word', index)
    },
    openImportModal() {
      this.$emit('open-import-modal')
    },
    openPasteModal() {
      this.$emit('open-paste-modal')
    }
  }
}
</script>

<style scoped>
.progress-bar {
  height: 8px;
  background-color: theme('colors.background.lighter');
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #FF4081;
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-background-card rounded-lg shadow-lg w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Import from Word Set</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white text-xl">
          ✕
        </button>
      </div>
      
      <div v-if="wordSets.length === 0" class="text-center py-4 mb-6">
        <p class="text-gray-400 mb-2">You don't have any word sets yet.</p>
        <router-link to="/word-sets" class="text-primary hover:text-primary-light">
          Create a word set first
        </router-link>
      </div>
      
      <div v-else>
        <div class="form-group mb-6">
          <label for="wordSetSelect" class="block text-sm text-gray-400 mb-2">Select a Word Set</label>
          <select 
            id="wordSetSelect" 
            v-model="selectedSetId" 
            class="form-control w-full"
          >
            <option v-for="(set, index) in wordSets" :key="index" :value="index">
              {{ set.name }} ({{ set.words.length }} words)
            </option>
          </select>
        </div>
        
        <div v-if="selectedSetId !== null" class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm text-gray-400">Word List Preview</h3>
            <span class="text-xs text-gray-500">{{ wordSets[selectedSetId].words.length }} words</span>
          </div>
          <div class="bg-background-lighter p-3 rounded h-40 overflow-y-auto">
            <div v-for="(word, wordIndex) in wordSets[selectedSetId].words.slice(0, 10)" :key="wordIndex" class="text-sm mb-1">
              {{ word }}
            </div>
            <div v-if="wordSets[selectedSetId].words.length > 10" class="text-xs text-gray-500 italic mt-2">
              And {{ wordSets[selectedSetId].words.length - 10 }} more...
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="$emit('close')" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button 
            @click="importSet" 
            class="btn btn-primary"
            :disabled="selectedSetId === null"
          >
            Import Words
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WordSetImporter',
  props: {
    wordSets: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedSetId: null
    }
  },
  emits: ['import', 'close'],
  methods: {
    importSet() {
      if (this.selectedSetId === null) return
      
      const wordSet = this.wordSets[this.selectedSetId]
      if (!wordSet || !wordSet.words || wordSet.words.length === 0) {
        this.$emit('error', 'Selected word set is empty')
        return
      }
      
      this.$emit('import', wordSet)
    }
  }
}
</script>

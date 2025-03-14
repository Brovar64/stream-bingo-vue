<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-background-card rounded-lg shadow-lg w-full max-w-2xl p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Paste Multiple Words</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white text-xl">
          ✕
        </button>
      </div>
      
      <div class="mb-6">
        <p class="text-sm text-gray-400 mb-2">
          Paste words or phrases, one per line. Empty lines will be ignored.
        </p>
        <textarea 
          v-model="textInput" 
          class="form-control w-full h-48 font-mono"
          placeholder="Enter each word or phrase on a new line..."
        ></textarea>
      </div>
      
      <div class="flex items-center justify-between mb-6">
        <label for="wordListFile" class="btn bg-background-lighter hover:bg-gray-700 text-white cursor-pointer">
          Import from TXT File
        </label>
        <input 
          type="file" 
          id="wordListFile" 
          accept=".txt" 
          @change="handleFileImport" 
          class="hidden"
        >
        
        <div class="text-sm text-gray-400">
          <span class="font-bold">{{ parsedWords.length }}</span> words detected
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
          @click="addWords" 
          class="btn btn-primary"
          :disabled="parsedWords.length === 0"
        >
          Add Words
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultiWordsPaste',
  data() {
    return {
      textInput: ''
    }
  },
  computed: {
    parsedWords() {
      if (!this.textInput.trim()) return []
      return this.textInput
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
    }
  },
  emits: ['add-words', 'close', 'error'],
  methods: {
    // Handle file import
    handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = e => {
        this.textInput = e.target.result
      }
      reader.onerror = () => {
        this.$emit('error', 'Failed to read file')
      }
      reader.readAsText(file)
    },
    
    // Add parsed words
    addWords() {
      if (this.parsedWords.length === 0) return
      
      this.$emit('add-words', this.parsedWords)
    }
  }
}
</script>

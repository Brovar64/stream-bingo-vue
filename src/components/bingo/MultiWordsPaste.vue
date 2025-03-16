<template>
  <BaseModal 
    v-model="showModal" 
    title="Paste Multiple Words" 
    size="large"
  >
    <BaseTextarea
      v-model="textInput"
      label="Paste words or phrases, one per line"
      helpText="Empty lines will be ignored"
      placeholder="Enter each word or phrase on a new line..."
      rows="10"
      :spellcheck="false"
      textareaClass="font-mono"
      :showCount="true"
    />
    
    <div class="flex items-center justify-between my-6">
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
    
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button 
          @click="cancel" 
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
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/base/BaseModal.vue';
import BaseTextarea from '@/components/base/BaseTextarea.vue';

export default {
  name: 'MultiWordsPaste',
  components: {
    BaseModal,
    BaseTextarea
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-words', 'update:modelValue', 'error'],
  data() {
    return {
      textInput: ''
    }
  },
  computed: {
    showModal: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    parsedWords() {
      if (!this.textInput.trim()) return []
      return this.textInput
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
    }
  },
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
      this.closeModal()
    },
    
    // Close modal
    closeModal() {
      this.showModal = false
      this.textInput = ''
    },
    
    // Cancel action
    cancel() {
      this.closeModal()
    }
  }
}
</script>

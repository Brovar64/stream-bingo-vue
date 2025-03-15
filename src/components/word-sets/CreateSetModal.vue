<template>
  <teleport to="body">
    <div v-show="visible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">
            {{ typeLabel }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <div v-if="type === 'word'" class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Enter or Paste Words</label>
          <p class="text-sm text-gray-500 mb-3">
            Each word or phrase should be on a new line. Empty lines will be ignored.
          </p>
          <textarea 
            v-model="wordInput" 
            class="form-control w-full h-48 font-mono"
            placeholder="Enter words here..."
          ></textarea>
        </div>
        
        <div v-else class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Enter Phrase and Punishment Pairs</label>
          <p class="text-sm text-gray-500 mb-3">
            Format: "Phrase|Punishment" (one pair per line)
          </p>
          <textarea 
            v-model="punishmentInput" 
            class="form-control w-full h-48 font-mono"
            placeholder="When X happens|Do Y punishment&#10;Another trigger|Another punishment&#10;..."
          ></textarea>
        </div>
        
        <div class="flex justify-between items-center mb-6">
          <div>
            <label for="fileInput" class="btn bg-background-lighter hover:bg-gray-700 text-white cursor-pointer">
              Import from TXT File
            </label>
            <input 
              type="file" 
              id="fileInput" 
              accept=".txt" 
              @change="handleFileImport" 
              class="hidden"
            >
          </div>
          
          <div class="text-gray-400">
            <span class="font-bold">
              {{ type === 'word' ? parsedWords.length : parsedPunishments.length }}
            </span> 
            {{ type === 'word' ? 'words' : 'entries' }}
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeModal" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button 
            @click="saveSet" 
            class="btn btn-primary"
            :disabled="type === 'word' ? parsedWords.length === 0 : parsedPunishments.length === 0"
          >
            Save Set
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: 'CreateSetModal',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'word',
      validator: (value) => ['word', 'playerPunishment', 'creatorPunishment'].includes(value)
    },
    setName: {
      type: String,
      default: ''
    }
  },
  
  emits: ['update:visible', 'save', 'cancel', 'file-error'],
  
  data() {
    return {
      wordInput: '',
      punishmentInput: ''
    };
  },
  
  computed: {
    typeLabel() {
      switch (this.type) {
        case 'word':
          return `Create Word Set: ${this.setName}`;
        case 'playerPunishment':
          return `Create Player Punishment Set: ${this.setName}`;
        case 'creatorPunishment':
          return `Create Creator Punishment Set: ${this.setName}`;
        default:
          return `Create Set: ${this.setName}`;
      }
    },
    
    parsedWords() {
      if (!this.wordInput.trim()) return [];
      return this.wordInput
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0);
    },
    
    parsedPunishments() {
      if (!this.punishmentInput.trim()) return [];
      return this.punishmentInput
        .split('\n')
        .map(line => {
          const parts = line.split('|');
          if (parts.length === 2) {
            return {
              phrase: parts[0].trim(),
              punishment: parts[1].trim()
            };
          }
          return null;
        })
        .filter(entry => entry && entry.phrase && entry.punishment);
    }
  },
  
  watch: {
    visible(newVal) {
      console.log('Modal visibility changed:', newVal);
    }
  },
  
  methods: {
    closeModal() {
      this.wordInput = '';
      this.punishmentInput = '';
      this.$emit('update:visible', false);
      this.$emit('cancel');
    },
    
    saveSet() {
      if (this.type === 'word') {
        if (this.parsedWords.length === 0) return;
        this.$emit('save', {
          type: this.type,
          name: this.setName,
          content: this.parsedWords
        });
      } else {
        if (this.parsedPunishments.length === 0) return;
        this.$emit('save', {
          type: this.type,
          name: this.setName,
          content: this.parsedPunishments
        });
      }
      
      this.wordInput = '';
      this.punishmentInput = '';
      this.$emit('update:visible', false);
    },
    
    handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = e => {
        if (this.type === 'word') {
          this.wordInput = e.target.result;
        } else {
          this.punishmentInput = e.target.result;
        }
      };
      reader.onerror = () => {
        this.$emit('file-error', 'Failed to read file');
      };
      reader.readAsText(file);
      
      // Reset file input to allow selecting the same file again
      event.target.value = '';
    }
  }
}
</script>
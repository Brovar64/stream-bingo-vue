<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">
          {{ typeLabel }}: {{ setName }}
        </h2>
        <button @click="closeModal" class="text-gray-400 hover:text-white text-xl">
          ✕
        </button>
      </div>
      
      <!-- Word Set Editing -->
      <div v-if="type === 'word'">
        <div v-if="editing" class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Edit Words</label>
          <textarea 
            v-model="wordInput" 
            class="form-control w-full h-48 font-mono"
            placeholder="Enter words here..."
          ></textarea>
        </div>
        
        <div v-else class="mb-6">
          <div class="flex justify-between items-center mb-3">
            <label class="block text-sm text-gray-400">All Words ({{ setWords.length }})</label>
            <button 
              @click="startEditing" 
              class="text-primary hover:text-primary-light"
            >
              Edit Words
            </button>
          </div>
          
          <div class="bg-background-lighter p-3 rounded h-64 overflow-y-auto">
            <div v-for="(word, index) in setWords" :key="index" class="mb-1">
              {{ word }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Punishment Set Editing -->
      <div v-else>
        <div v-if="editing" class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Edit Phrase/Punishment Pairs</label>
          <textarea 
            v-model="punishmentInput" 
            class="form-control w-full h-48 font-mono"
            placeholder="Phrase|Punishment&#10;Another phrase|Another punishment"
          ></textarea>
        </div>
        
        <div v-else class="mb-6">
          <div class="flex justify-between items-center mb-3">
            <label class="block text-sm text-gray-400">
              All Entries ({{ setPunishments.length }})
            </label>
            <button 
              @click="startEditing" 
              class="text-primary hover:text-primary-light"
            >
              Edit Entries
            </button>
          </div>
          
          <div class="bg-background-lighter p-3 rounded h-64 overflow-y-auto">
            <div v-for="(entry, index) in setPunishments" :key="index" class="mb-3 p-2 bg-background rounded">
              <div class="font-medium">{{ entry.phrase }}</div>
              <div class="text-sm italic text-gray-400">{{ entry.punishment }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="editing" class="flex justify-between items-center mb-6">
        <div>
          <label :for="'editFileInput_' + _uid" class="btn bg-background-lighter hover:bg-gray-700 text-white cursor-pointer">
            Import from TXT File
          </label>
          <input 
            type="file" 
            :id="'editFileInput_' + _uid" 
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
          {{ editing ? 'Cancel' : 'Close' }}
        </button>
        
        <button 
          v-if="editing"
          @click="saveChanges" 
          class="btn btn-primary"
          :disabled="type === 'word' ? parsedWords.length === 0 : parsedPunishments.length === 0"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewEditModal',
  
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
    },
    setWords: {
      type: Array,
      default: () => []
    },
    setPunishments: {
      type: Array, 
      default: () => []
    }
  },
  
  emits: ['update:visible', 'save', 'cancel'],
  
  data() {
    return {
      editing: false,
      wordInput: '',
      punishmentInput: ''
    };
  },
  
  computed: {
    typeLabel() {
      switch (this.type) {
        case 'word':
          return 'Word Set';
        case 'playerPunishment':
          return 'Player Punishment Set';
        case 'creatorPunishment':
          return 'Creator Punishment Set';
        default:
          return 'Set';
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
  
  methods: {
    startEditing() {
      this.editing = true;
      
      if (this.type === 'word') {
        this.wordInput = this.setWords.join('\n');
      } else {
        this.punishmentInput = this.setPunishments
          .map(entry => `${entry.phrase}|${entry.punishment}`)
          .join('\n');
      }
    },
    
    closeModal() {
      if (this.editing) {
        this.editing = false;
        this.wordInput = '';
        this.punishmentInput = '';
      } else {
        this.$emit('update:visible', false);
        this.$emit('cancel');
      }
    },
    
    saveChanges() {
      if (this.type === 'word') {
        if (this.parsedWords.length === 0) return;
        this.$emit('save', {
          type: this.type,
          content: this.parsedWords
        });
      } else {
        if (this.parsedPunishments.length === 0) return;
        this.$emit('save', {
          type: this.type,
          content: this.parsedPunishments
        });
      }
      
      this.editing = false;
      this.wordInput = '';
      this.punishmentInput = '';
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

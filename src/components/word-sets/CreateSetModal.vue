<template>
  <div v-if="visible" class="modal-wrapper">
    <div class="modal-backdrop" @click="closeModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">{{ typeLabel }}</h2>
        <button @click="closeModal" class="modal-close">✕</button>
      </div>
      
      <div v-if="type === 'word'" class="modal-body">
        <label class="label">Enter or Paste Words</label>
        <p class="help-text">
          Each word or phrase should be on a new line. Empty lines will be ignored.
        </p>
        <textarea 
          v-model="wordInput" 
          class="textarea"
          placeholder="Enter words here..."
        ></textarea>
      </div>
      
      <div v-else class="modal-body">
        <label class="label">Enter Phrase and Punishment Pairs</label>
        <p class="help-text">
          Format: "Phrase|Punishment" (one pair per line)
        </p>
        <textarea 
          v-model="punishmentInput" 
          class="textarea"
          placeholder="When X happens|Do Y punishment&#10;Another trigger|Another punishment&#10;..."
        ></textarea>
      </div>
      
      <div class="modal-actions">
        <div class="file-input-wrapper">
          <label for="fileInput" class="file-input-label">Import from TXT File</label>
          <input 
            type="file" 
            id="fileInput" 
            accept=".txt" 
            @change="handleFileImport" 
            class="hidden-input"
          >
        </div>
        
        <div class="count">
          <span class="count-value">{{ type === 'word' ? parsedWords.length : parsedPunishments.length }}</span> 
          {{ type === 'word' ? 'words' : 'entries' }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          @click="closeModal" 
          class="btn-cancel"
        >
          Cancel
        </button>
        <button 
          @click="saveSet" 
          class="btn-save"
          :disabled="type === 'word' ? parsedWords.length === 0 : parsedPunishments.length === 0"
        >
          Save Set
        </button>
      </div>
    </div>
  </div>
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

<style scoped>
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
}

.modal-container {
  position: relative;
  background-color: #1E1E1E;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 48rem;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-close {
  color: #9CA3AF;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.modal-close:hover {
  color: white;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  font-size: 0.875rem;
  color: #9CA3AF;
  margin-bottom: 0.5rem;
}

.help-text {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.75rem;
}

.textarea {
  width: 100%;
  min-height: 12rem;
  background-color: #2D2D2D;
  border: 1px solid #4B5563;
  border-radius: 0.375rem;
  padding: 0.75rem;
  color: white;
  font-family: monospace;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.file-input-wrapper {
  position: relative;
}

.file-input-label {
  display: inline-block;
  background-color: #2D2D2D;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.file-input-label:hover {
  background-color: #4B5563;
}

.hidden-input {
  display: none;
}

.count {
  color: #9CA3AF;
}

.count-value {
  font-weight: 700;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  background-color: #2D2D2D;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #4B5563;
}

.btn-save {
  background-color: #FF4081;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-save:hover {
  background-color: #C51162;
}

.btn-save:disabled {
  background-color: #6B7280;
  cursor: not-allowed;
}
</style>
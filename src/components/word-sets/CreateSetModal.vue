<template>
  <div class="modal-container" v-if="visible">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ typeLabel }}</h2>
        <button @click="closeModal" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <div v-if="type === 'word'">
          <label>Enter or Paste Words</label>
          <p class="help-text">Each word or phrase should be on a new line. Empty lines will be ignored.</p>
          <textarea v-model="wordInput" placeholder="Enter words here..."></textarea>
        </div>
        
        <div v-else>
          <label>Enter Phrase and Punishment Pairs</label>
          <p class="help-text">Format: "Phrase|Punishment" (one pair per line)</p>
          <textarea v-model="punishmentInput" placeholder="When X happens|Do Y punishment"></textarea>
        </div>
        
        <div class="file-input">
          <button @click="triggerFileInput" class="btn-secondary">Import from TXT File</button>
          <input type="file" id="fileInput" ref="fileInput" accept=".txt" @change="handleFileImport" style="display:none">
          <span class="count">{{ type === 'word' ? parsedWords.length : parsedPunishments.length }} {{ type === 'word' ? 'words' : 'entries' }}</span>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="btn-secondary">Cancel</button>
        <button 
          @click="saveSet" 
          class="btn-primary"
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
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
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
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: #1E1E1E;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-body label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.help-text {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 10px;
}

textarea {
  width: 100%;
  min-height: 200px;
  background-color: #2D2D2D;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 10px;
  color: white;
  font-family: monospace;
  margin-bottom: 15px;
}

.file-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.count {
  font-size: 0.9rem;
  color: #ccc;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #333;
  gap: 10px;
}

.btn-primary {
  background-color: #FF4081;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #333;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background-color: #D81B60;
}

.btn-secondary:hover {
  background-color: #444;
}
</style>
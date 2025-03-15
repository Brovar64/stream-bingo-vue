<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ typeLabel }}</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>
      
      <div class="modal-body">
        <template v-if="type === 'word'">
          <label>Enter or Paste Words</label>
          <p class="help-text">Each word or phrase should be on a new line. Empty lines will be ignored.</p>
          <textarea v-model="wordInput" placeholder="Enter words here..."></textarea>
        </template>
        
        <template v-else>
          <label>Enter Phrase and Punishment Pairs</label>
          <p class="help-text">Format: "Phrase|Punishment" (one pair per line)</p>
          <textarea v-model="punishmentInput" placeholder="When X happens|Do Y punishment"></textarea>
        </template>
        
        <div class="file-input-container">
          <label class="file-input-label">
            Import from TXT File
            <input type="file" accept=".txt" @change="handleFileImport" class="file-input">
          </label>
          <div class="count">
            {{ type === 'word' ? parsedWords.length : parsedPunishments.length }}
            {{ type === 'word' ? 'words' : 'entries' }}
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="cancel-button">Cancel</button>
        <button 
          @click="saveSet"
          :disabled="type === 'word' ? parsedWords.length === 0 : parsedPunishments.length === 0"
          class="save-button"
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
    visible: Boolean,
    type: {
      type: String,
      default: 'word'
    },
    setName: String
  },
  emits: ['update:visible', 'save', 'cancel'],
  data() {
    return {
      wordInput: '',
      punishmentInput: ''
    }
  },
  computed: {
    typeLabel() {
      return `Create ${this.type === 'word' ? 'Word' : this.type === 'playerPunishment' ? 'Player Punishment' : 'Creator Punishment'} Set: ${this.setName}`;
    },
    parsedWords() {
      return this.wordInput.trim() 
        ? this.wordInput.split('\n').map(w => w.trim()).filter(w => w)
        : [];
    },
    parsedPunishments() {
      if (!this.punishmentInput.trim()) return [];
      return this.punishmentInput.split('\n')
        .map(line => {
          const parts = line.split('|');
          return parts.length === 2 
            ? { phrase: parts[0].trim(), punishment: parts[1].trim() }
            : null;
        })
        .filter(p => p && p.phrase && p.punishment);
    }
  },
  methods: {
    closeModal() {
      this.wordInput = '';
      this.punishmentInput = '';
      this.$emit('update:visible', false);
    },
    saveSet() {
      if ((this.type === 'word' && this.parsedWords.length === 0) ||
          (this.type !== 'word' && this.parsedPunishments.length === 0)) {
        return;
      }
      
      this.$emit('save', {
        type: this.type,
        name: this.setName,
        content: this.type === 'word' ? this.parsedWords : this.parsedPunishments
      });
      
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
      reader.readAsText(file);
      event.target.value = '';
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: #1E1E1E;
  border-radius: 8px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 15px;
}

.modal-body label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.help-text {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 10px;
}

textarea {
  width: 100%;
  height: 180px;
  background: #2D2D2D;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  padding: 10px;
  margin-bottom: 15px;
  font-family: monospace;
}

.file-input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.file-input {
  display: none;
}

.file-input-label {
  background: #2D2D2D;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
}

.count {
  color: #999;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  border-top: 1px solid #333;
  gap: 10px;
}

.cancel-button {
  background: #2D2D2D;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.save-button {
  background: #FF4081;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:disabled {
  background: #666;
  cursor: not-allowed;
}
</style>
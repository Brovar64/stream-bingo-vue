
<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ typeLabel }}</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>
      
      <div class="modal-body">
        <label>Enter Items (one per line)</label>
        <p class="help-text">
          {{ getHelpText() }}
        </p>
        <textarea v-model="itemInput" placeholder="Enter items here..."></textarea>
      </div>
      
      <div class="file-input-container">
        <label class="file-input-label">
          Import from TXT File
          <input type="file" accept=".txt" @change="handleFileImport" class="file-input">
        </label>
        <div class="count">
          {{ parsedItems.length }} items
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="cancel-button">Cancel</button>
        <button 
          @click="saveSet"
          :disabled="parsedItems.length === 0"
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
      itemInput: ''
    }
  },
  computed: {
    typeLabel() {
      return `Create ${this.getTypeLabel()} Set: ${this.setName}`;
    },
    parsedItems() {
      if (!this.itemInput.trim()) return [];
      
      return this.itemInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
  },
  methods: {
    getTypeLabel() {
      switch(this.type) {
        case 'word': return 'Word';
        case 'playerPunishment': return 'Player Punishment';
        case 'creatorPunishment': return 'Creator Punishment';
        default: return 'Unknown';
      }
    },
    getHelpText() {
      if (this.type === 'word') {
        return 'Each line should contain a word or phrase that might happen during your stream.';
      } else if (this.type === 'playerPunishment') {
        return 'Each line should contain a punishment that viewers might have to do.';
      } else if (this.type === 'creatorPunishment') {
        return 'Each line should contain a punishment that you (the streamer) might have to do.';
      }
      return '';
    },
    closeModal() {
      this.itemInput = '';
      this.$emit('update:visible', false);
    },
    saveSet() {
      if (this.parsedItems.length === 0) {
        return;
      }
      
      this.$emit('save', {
        type: this.type,
        name: this.setName,
        content: this.parsedItems
      });
      
      this.itemInput = '';
    },
    handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = e => {
        this.itemInput = e.target.result;
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
  padding: 0 15px;
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


<template>
  <teleport to="body">
    <div v-show="visible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">
            {{ typeLabel }}: {{ setName }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <div v-if="editing" class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Edit Items</label>
          <textarea 
            v-model="itemInput" 
            class="form-control w-full h-48 font-mono"
            :placeholder="`Enter each ${type === 'word' ? 'word' : 'punishment'} on a new line`"
          ></textarea>
        </div>
        
        <div v-else class="mb-6">
          <div class="flex justify-between items-center mb-3">
            <label class="block text-sm text-gray-400">All Items ({{ setItems.length }})</label>
            <button 
              @click="startEditing" 
              class="text-primary hover:text-primary-light"
            >
              Edit Items
            </button>
          </div>
          
          <div class="bg-background-lighter p-3 rounded h-64 overflow-y-auto">
            <div v-for="(item, index) in setItems" :key="index" class="mb-1">
              {{ item }}
            </div>
          </div>
        </div>
        
        <div v-if="editing" class="flex justify-between items-center mb-6">
          <div>
            <label for="editFileInput" class="btn bg-background-lighter hover:bg-gray-700 text-white cursor-pointer">
              Import from TXT File
            </label>
            <input 
              type="file" 
              id="editFileInput" 
              accept=".txt" 
              @change="handleFileImport" 
              class="hidden"
            >
          </div>
          
          <div class="text-gray-400">
            <span class="font-bold">
              {{ parsedItems.length }}
            </span> 
            items
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
            :disabled="parsedItems.length === 0"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </teleport>
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
    setItems: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['update:visible', 'save', 'cancel', 'file-error'],
  
  data() {
    return {
      editing: false,
      itemInput: ''
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
    
    parsedItems() {
      if (!this.itemInput.trim()) return [];
      
      return this.itemInput
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
  },
  
  watch: {
    visible(newVal) {
      console.log('ViewEditModal visibility changed:', newVal);
    }
  },
  
  methods: {
    startEditing() {
      this.editing = true;
      
      // Format items - all sets are now simple string arrays
      this.itemInput = this.setItems.join('\n');
    },
    
    closeModal() {
      console.log('ViewEditModal closeModal called, editing:', this.editing);
      if (this.editing) {
        this.editing = false;
        this.itemInput = '';
      } else {
        this.$emit('update:visible', false);
        this.$emit('cancel');
      }
    },
    
    saveChanges() {
      console.log('ViewEditModal saveChanges called');
      if (this.parsedItems.length === 0) return;
      
      this.$emit('save', {
        type: this.type,
        content: this.parsedItems
      });
      
      this.editing = false;
      this.itemInput = '';
    },
    
    handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = e => {
        this.itemInput = e.target.result;
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

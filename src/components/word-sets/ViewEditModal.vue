<template>
  <BaseModal
    v-model="localVisible"
    :title="typeLabel + ': ' + setName"
    size="large"
  >
    <div v-if="editing">
      <BaseTextarea
        v-model="itemInput"
        label="Edit Items"
        :placeholder="`Enter each ${type === 'word' ? 'word' : 'punishment'} on a new line`"
        rows="12"
        :spellcheck="false"
        textareaClass="font-mono"
        :showCount="true"
      />
      
      <div class="flex justify-between items-center my-6">
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
      
      <BaseCard padding="small" variant="light" bodyClass="h-64 overflow-y-auto">
        <div v-for="(item, index) in setItems" :key="index" class="mb-1">
          {{ item }}
        </div>
      </BaseCard>
    </div>
    
    <template #footer>
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
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/base/BaseModal.vue';
import BaseTextarea from '@/components/base/BaseTextarea.vue';
import BaseCard from '@/components/base/BaseCard.vue';

export default {
  name: 'ViewEditModal',
  components: {
    BaseModal,
    BaseTextarea,
    BaseCard
  },
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
    localVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit('update:visible', value);
      }
    },
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
  
  methods: {
    startEditing() {
      this.editing = true;
      
      // Format items - all sets are now simple string arrays
      this.itemInput = this.setItems.join('\n');
    },
    
    closeModal() {
      if (this.editing) {
        this.editing = false;
        this.itemInput = '';
      } else {
        this.localVisible = false;
        this.$emit('cancel');
      }
    },
    
    saveChanges() {
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

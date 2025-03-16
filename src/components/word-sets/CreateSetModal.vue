<template>
  <BaseModal
    v-model="localVisible"
    :title="typeLabel"
    size="large"
  >
    <BaseTextarea
      v-model="itemInput"
      label="Enter Items (one per line)"
      :helpText="getHelpText()"
      placeholder="Enter items here..."
      rows="10"
      :spellcheck="false"
      textareaClass="font-mono"
      :showCount="true"
    />
    
    <div class="flex items-center justify-between my-6">
      <label for="importFileInput" class="btn bg-background-lighter hover:bg-gray-700 text-white cursor-pointer">
        Import from TXT File
      </label>
      <input 
        type="file" 
        id="importFileInput" 
        accept=".txt" 
        @change="handleFileImport" 
        class="hidden"
      >
      
      <div class="text-sm text-gray-400">
        <span class="font-bold">{{ parsedItems.length }}</span> items
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button 
          @click="closeModal" 
          class="btn bg-background-lighter hover:bg-gray-700 text-white"
        >
          Cancel
        </button>
        <button 
          @click="saveSet"
          :disabled="parsedItems.length === 0"
          class="btn btn-primary"
        >
          Save Set
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/base/BaseModal.vue';
import BaseTextarea from '@/components/base/BaseTextarea.vue';

export default {
  name: 'CreateSetModal',
  components: {
    BaseModal,
    BaseTextarea
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'word'
    },
    setName: {
      type: String,
      default: ''
    }
  },
  emits: ['update:visible', 'save', 'cancel'],
  data() {
    return {
      itemInput: ''
    }
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
      this.localVisible = false;
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
      this.localVisible = false;
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

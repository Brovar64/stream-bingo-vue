<template>
  <BaseModal
    v-model="localVisible"
    :title="isEditing ? 'Edit Cell' : 'Add New Cell'"
    size="small"
  >
    <form @submit.prevent="save">
      <BaseInput
        v-model="editedCell.phrase"
        label="Phrase"
        placeholder="Enter bingo phrase"
        required
      />
      
      <BaseInput
        v-model="editedCell.punishment"
        label="Punishment"
        placeholder="Enter punishment"
        required
      />
      
      <div class="text-sm text-gray-400 mb-4">
        Cell position: Row {{ position.row + 1 }}, Column {{ position.col + 1 }} 
        ({{ side === 'left' ? 'Creator' : 'Players' }} side)
      </div>
    </form>
    
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button 
          type="button" 
          @click="cancel" 
          class="btn bg-background-lighter hover:bg-gray-700 text-white"
        >
          Cancel
        </button>
        <button 
          @click="save" 
          class="btn btn-primary"
        >
          Save
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/base/BaseModal.vue';
import BaseInput from '@/components/base/BaseInput.vue';

export default {
  name: 'PunishmentCellEditor',
  components: {
    BaseModal,
    BaseInput
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    cell: {
      type: Object,
      default: () => null
    },
    position: {
      type: Object,
      default: () => ({ row: 0, col: 0 })
    },
    side: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right'].includes(value)
    }
  },
  emits: ['update:visible', 'save', 'cancel'],
  data() {
    return {
      editedCell: {
        phrase: '',
        punishment: ''
      }
    }
  },
  computed: {
    isEditing() {
      return !!this.cell
    },
    localVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit('update:visible', value);
      }
    }
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.resetForm()
      }
    },
    cell(newValue) {
      if (newValue) {
        this.editedCell.phrase = newValue.phrase || ''
        this.editedCell.punishment = newValue.punishment || ''
      } else {
        this.resetForm()
      }
    }
  },
  methods: {
    resetForm() {
      if (this.cell) {
        this.editedCell.phrase = this.cell.phrase || ''
        this.editedCell.punishment = this.cell.punishment || ''
      } else {
        this.editedCell.phrase = ''
        this.editedCell.punishment = ''
      }
    },
    save() {
      this.$emit('save', {
        phrase: this.editedCell.phrase,
        punishment: this.editedCell.punishment,
        position: this.position,
        side: this.side
      })
    },
    cancel() {
      this.localVisible = false
      this.$emit('cancel')
    }
  }
}
</script>

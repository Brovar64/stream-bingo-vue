<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="text-lg font-semibold">
          {{ isEditing ? 'Edit Cell' : 'Add New Cell' }}
        </h3>
        <button @click="cancel" class="close-button">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="save">
          <div class="form-group">
            <label for="phrase">Phrase</label>
            <input 
              type="text" 
              id="phrase" 
              v-model="editedCell.phrase" 
              class="form-control"
              placeholder="Enter bingo phrase" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="punishment">Punishment</label>
            <input 
              type="text" 
              id="punishment" 
              v-model="editedCell.punishment" 
              class="form-control"
              placeholder="Enter punishment" 
              required
            />
          </div>
          
          <div class="text-sm text-gray-400 mb-4">
            Cell position: Row {{ position.row + 1 }}, Column {{ position.col + 1 }} 
            ({{ side === 'left' ? 'Creator' : 'Players' }} side)
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              @click="cancel" 
              class="btn bg-background-lighter hover:bg-gray-700 text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PunishmentCellEditor',
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
      this.$emit('update:visible', false)
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-container {
  @apply bg-background-card rounded-lg shadow-lg w-full max-w-md;
}

.modal-header {
  @apply flex justify-between items-center p-4 border-b border-gray-700;
}

.modal-body {
  @apply p-4;
}

.close-button {
  @apply text-2xl text-gray-400 hover:text-white;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-300 mb-1;
}
</style>

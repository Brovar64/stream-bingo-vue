<template>
  <BaseModal v-model="localShow" :title="title" size="small">
    <p class="confirm-message">{{ message }}</p>
    
    <template #footer>
      <div class="flex justify-end space-x-3">
        <button 
          @click="handleCancel" 
          class="btn bg-background-lighter hover:bg-gray-700 text-white"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          class="btn" 
          :class="confirmButtonClass"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from './BaseModal.vue';

export default {
  name: 'BaseConfirmDialog',
  components: {
    BaseModal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirm Action'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'danger', 'warning', 'success'].includes(value)
    }
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  
  computed: {
    localShow: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    confirmButtonClass() {
      switch (this.variant) {
        case 'danger':
          return 'bg-error hover:bg-red-700 text-white';
        case 'warning':
          return 'bg-warning hover:bg-yellow-700 text-white';
        case 'success':
          return 'bg-success hover:bg-green-700 text-white';
        case 'primary':
        default:
          return 'bg-primary hover:bg-primary-dark text-white';
      }
    }
  },
  
  methods: {
    handleConfirm() {
      this.$emit('confirm');
      this.localShow = false;
    },
    
    handleCancel() {
      this.$emit('cancel');
      this.localShow = false;
    }
  }
}
</script>

<style scoped>
.confirm-message {
  margin-bottom: 16px;
  white-space: pre-line; /* To respect line breaks in messages */
}
</style>
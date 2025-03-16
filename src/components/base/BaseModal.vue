<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content" :class="[contentClass, size]">
          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button @click="closeModal" class="close-button" aria-label="Close">×</button>
          </div>
          
          <div class="modal-body">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer">
              <button @click="closeModal" class="btn bg-background-lighter hover:bg-gray-700 text-white">
                {{ cancelText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    contentClass: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'fullscreen'].includes(value)
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'close'],
  
  mounted() {
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.handleEscKey);
    }
    // Prevent body scrolling when modal is open
    if (this.modelValue) {
      document.body.classList.add('modal-open');
    }
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
    document.body.classList.remove('modal-open');
  },
  
  watch: {
    modelValue(newVal) {
      if (newVal) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }
  },
  
  methods: {
    closeModal() {
      if (this.closeOnClickOutside) {
        this.$emit('update:modelValue', false);
        this.$emit('close');
      }
    },
    
    handleEscKey(event) {
      if (this.modelValue && event.key === 'Escape') {
        this.closeModal();
      }
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: #1E1E1E;
  border-radius: 8px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90%;
  display: flex;
  flex-direction: column;
}

.modal-content.small {
  max-width: 400px;
}

.modal-content.medium {
  max-width: 600px;
}

.modal-content.large {
  max-width: 800px;
}

.modal-content.fullscreen {
  width: 95%;
  max-width: 1200px;
  height: 90vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: white;
}

.modal-body {
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #333;
  gap: 10px;
}

/* Transition effects */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Global style to prevent body scrolling when modal is open */
:global(body.modal-open) {
  overflow: hidden;
}
</style>
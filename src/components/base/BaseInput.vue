<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    
    <div class="input-wrapper" :class="{ 'has-icon': $slots.icon }">
      <slot name="icon"></slot>
      
      <input
        :id="id"
        :value="modelValue"
        @input="onInput"
        class="form-control"
        :class="inputClass"
        :placeholder="placeholder"
        :type="type"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :spellcheck="spellcheck"
        ref="input"
        v-bind="$attrs"
      />
      
      <button
        v-if="clearable && modelValue"
        type="button"
        @click="clear"
        class="clear-button"
        aria-label="Clear input"
      >
        ×
      </button>
    </div>
    
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-else-if="helpText" class="help-text">{{ helpText }}</p>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    id: {
      type: String,
      default() {
        return `input-${Math.random().toString(36).substring(2, 9)}`;
      }
    },
    helpText: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: [String, Number],
      default: null
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    spellcheck: {
      type: Boolean,
      default: false
    },
    inputClass: {
      type: String,
      default: ''
    },
    debounce: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:modelValue', 'input', 'change', 'clear', 'focus', 'blur'],
  
  data() {
    return {
      debounceTimeout: null
    };
  },
  
  methods: {
    onInput(event) {
      const value = event.target.value;
      
      if (this.debounce > 0) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
          this.$emit('update:modelValue', value);
          this.$emit('input', value);
        }, this.debounce);
      } else {
        this.$emit('update:modelValue', value);
        this.$emit('input', value);
      }
    },
    
    focus() {
      this.$refs.input.focus();
    },
    
    blur() {
      this.$refs.input.blur();
    },
    
    clear() {
      this.$emit('update:modelValue', '');
      this.$emit('clear');
      this.$nextTick(() => this.focus());
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: #CCCCCC;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper.has-icon .form-control {
  padding-left: 36px;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #2D2D2D;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #FF4081;
  box-shadow: 0 0 0 2px rgba(255, 64, 129, 0.25);
}

.form-control:disabled {
  background-color: #1E1E1E;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-control::placeholder {
  color: #777;
}

.has-error .form-control {
  border-color: #F44336;
}

.has-error .form-label {
  color: #F44336;
}

.clear-button {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  color: #999;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.clear-button:hover {
  color: #CCC;
}

.help-text {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #999;
}

.error-text {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #F44336;
}
</style>
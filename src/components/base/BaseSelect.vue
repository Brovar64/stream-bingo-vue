<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    
    <div class="select-wrapper">
      <select
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @change="$emit('change', $event.target.value)"
        class="form-select"
        :class="selectClass"
        :disabled="disabled"
        :required="required"
        v-bind="$attrs"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <slot></slot>
        <template v-if="options && options.length">
          <option 
            v-for="option in options" 
            :key="option.value || option" 
            :value="option.value || option"
            :disabled="option.disabled"
          >
            {{ option.label || option }}
          </option>
        </template>
      </select>
      <div class="select-arrow">▼</div>
    </div>
    
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-else-if="helpText" class="help-text">{{ helpText }}</p>
  </div>
</template>

<script>
export default {
  name: 'BaseSelect',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object],
      default: ''
    },
    options: {
      type: Array,
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Select an option'
    },
    id: {
      type: String,
      default() {
        return `select-${Math.random().toString(36).substring(2, 9)}`;
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
    required: {
      type: Boolean,
      default: false
    },
    selectClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change']
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

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 8px 36px 8px 12px;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #2D2D2D;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #FF4081;
  box-shadow: 0 0 0 2px rgba(255, 64, 129, 0.25);
}

.form-select:disabled {
  background-color: #1E1E1E;
  cursor: not-allowed;
  opacity: 0.7;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: #999;
  pointer-events: none;
}

.has-error .form-select {
  border-color: #F44336;
}

.has-error .form-label {
  color: #F44336;
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
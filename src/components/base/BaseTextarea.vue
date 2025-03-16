<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    
    <div class="textarea-wrapper">
      <textarea
        :id="id"
        :value="modelValue"
        @input="onInput"
        class="form-textarea"
        :class="textareaClass"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :spellcheck="spellcheck"
        ref="textarea"
        v-bind="$attrs"
      ></textarea>
      
      <div v-if="maxlength && showCount" class="character-count" :class="{ 'count-limit': isNearLimit }">
        {{ modelValue.length }} / {{ maxlength }}
      </div>
    </div>
    
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-else-if="helpText" class="help-text">{{ helpText }}</p>
  </div>
</template>

<script>
export default {
  name: 'BaseTextarea',
  props: {
    modelValue: {
      type: String,
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
    rows: {
      type: [String, Number],
      default: 4
    },
    id: {
      type: String,
      default() {
        return `textarea-${Math.random().toString(36).substring(2, 9)}`;
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
    maxlength: {
      type: [String, Number],
      default: null
    },
    showCount: {
      type: Boolean,
      default: false
    },
    spellcheck: {
      type: Boolean,
      default: false
    },
    textareaClass: {
      type: String,
      default: ''
    },
    autosize: {
      type: Boolean,
      default: false
    },
    debounce: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:modelValue', 'input', 'change', 'focus', 'blur'],
  
  data() {
    return {
      debounceTimeout: null
    };
  },
  
  computed: {
    isNearLimit() {
      if (!this.maxlength) return false;
      const threshold = Math.min(20, Math.floor(this.maxlength * 0.1));
      return this.modelValue.length >= (this.maxlength - threshold);
    }
  },
  
  mounted() {
    if (this.autosize) {
      this.adjustHeight();
    }
  },
  
  watch: {
    modelValue() {
      if (this.autosize) {
        this.$nextTick(this.adjustHeight);
      }
    }
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
    
    adjustHeight() {
      const textarea = this.$refs.textarea;
      if (!textarea) return;
      
      // Reset height to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Set the height to scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    
    focus() {
      this.$refs.textarea.focus();
    },
    
    blur() {
      this.$refs.textarea.blur();
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

.textarea-wrapper {
  position: relative;
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #2D2D2D;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #FF4081;
  box-shadow: 0 0 0 2px rgba(255, 64, 129, 0.25);
}

.form-textarea:disabled {
  background-color: #1E1E1E;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-textarea::placeholder {
  color: #777;
}

.has-error .form-textarea {
  border-color: #F44336;
}

.has-error .form-label {
  color: #F44336;
}

.character-count {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 0.75rem;
  color: #999;
  background-color: rgba(45, 45, 45, 0.8);
  padding: 2px 4px;
  border-radius: 4px;
}

.character-count.count-limit {
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
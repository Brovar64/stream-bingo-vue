<template>
  <div class="tabs-container" :class="containerClass">
    <div class="tabs-header" :class="headerClass">
      <button 
        v-for="tab in tabs"
        :key="tab.value"
        @click="selectTab(tab.value)"
        :class="['tab-button', modelValue === tab.value ? 'active' : '', 
                 tab.disabled ? 'disabled' : '', buttonClass]"
        :disabled="tab.disabled"
        :aria-selected="modelValue === tab.value"
        role="tab"
      >
        <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
        <div v-if="tab.badge" class="tab-badge" :class="tab.badgeClass">
          {{ tab.badge }}
        </div>
      </button>
    </div>
    <div class="tabs-content" :class="contentClass">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseTabs',
  props: {
    /**
     * The currently selected tab value
     */
    modelValue: {
      type: [String, Number],
      required: true
    },
    /**
     * Array of tab objects with the following properties:
     * - value: (required) unique value for the tab
     * - label: (required) display text for the tab
     * - icon: (optional) icon for the tab
     * - disabled: (optional) whether the tab is disabled
     * - badge: (optional) badge text for the tab
     * - badgeClass: (optional) custom class for the badge
     */
    tabs: {
      type: Array,
      required: true,
      validator: (tabs) => {
        return tabs.every(tab => 
          tab.value !== undefined && 
          tab.label !== undefined
        );
      }
    },
    /**
     * Custom class for the container
     */
    containerClass: {
      type: String,
      default: ''
    },
    /**
     * Custom class for the header
     */
    headerClass: {
      type: String,
      default: ''
    },
    /**
     * Custom class for the buttons
     */
    buttonClass: {
      type: String,
      default: ''
    },
    /**
     * Custom class for the content
     */
    contentClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'tab-change'],
  
  methods: {
    selectTab(value) {
      if (this.modelValue !== value) {
        this.$emit('update:modelValue', value);
        this.$emit('tab-change', value);
      }
    }
  }
}
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #333;
  margin-bottom: 16px;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: thin;
  -ms-overflow-style: none; /* IE and Edge */
}

.tabs-header::-webkit-scrollbar {
  height: 4px;
}

.tabs-header::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-header::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.tab-button {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #CCC;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.tab-button:hover:not(.disabled) {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.tab-button.active {
  color: #FF4081;
  border-bottom-color: #FF4081;
  background-color: rgba(255, 64, 129, 0.05);
}

.tab-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #FF4081;
  color: white;
  border-radius: 12px;
  font-size: 0.625rem;
  padding: 2px 6px;
  min-width: 16px;
  height: 16px;
}

.tabs-content {
  flex: 1;
}
</style>
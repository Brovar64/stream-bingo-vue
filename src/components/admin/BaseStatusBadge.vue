<template>
  <span
    class="status-badge"
    :class="[getBadgeClass, sizeClass]"
  >
    {{ displayText }}
  </span>
</template>

<script>
export default {
  name: 'BaseStatusBadge',
  props: {
    /**
     * Status value to display
     */
    status: {
      type: String,
      required: true
    },
    /**
     * Override the displayed text (optional)
     */
    displayText: {
      type: String,
      default: null
    },
    /**
     * Size of the badge
     */
    size: {
      type: String,
      default: 'default',
      validator: (val) => ['small', 'default', 'large'].includes(val)
    }
  },
  computed: {
    /**
     * Get the appropriate CSS class based on status
     */
    getBadgeClass() {
      switch (this.status.toLowerCase()) {
        case 'active':
          return 'bg-success';
        case 'setup':
          return 'bg-warning';
        case 'inactive':
          return 'bg-error';
        case 'pending':
          return 'bg-info';
        default:
          return 'bg-gray-500';
      }
    },
    
    /**
     * Get the text to display in the badge
     */
    statusText() {
      if (this.displayText) return this.displayText;
      
      // Capitalize first letter
      return this.status.charAt(0).toUpperCase() + this.status.slice(1);
    },
    
    /**
     * Get size CSS class
     */
    sizeClass() {
      switch(this.size) {
        case 'small':
          return 'status-badge-sm';
        case 'large':
          return 'status-badge-lg';
        default:
          return '';
      }
    }
  }
}
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}

.status-badge-sm {
  @apply text-xs py-0.5 px-1.5;
}

.status-badge-lg {
  @apply text-sm py-1.5 px-3;
}
</style>
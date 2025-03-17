<template>
  <header class="sticky-header">
    <div class="container flex justify-between items-center">
      <div class="flex items-center">
        <h2 class="text-xl font-semibold mr-2">{{ title }}</h2>
        <div v-if="status" class="status-badge" :class="statusClass">{{ status }}</div>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'StickyHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: null
    },
    statusVariant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'success', 'warning', 'error', 'info'].includes(value)
    }
  },
  computed: {
    statusClass() {
      switch (this.statusVariant) {
        case 'success': return 'bg-success';
        case 'warning': return 'bg-warning';
        case 'error': return 'bg-error';
        case 'info': return 'bg-info';
        default: return 'bg-gray-500';
      }
    }
  }
}
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}
</style>
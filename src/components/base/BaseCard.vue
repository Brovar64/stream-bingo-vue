<template>
  <div class="base-card" :class="classes">
    <div v-if="title || $slots.header" class="card-header">
      <h2 v-if="title" class="card-title">{{ title }}</h2>
      <slot v-else name="header"></slot>
      <div v-if="$slots['header-actions']" class="card-header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>
    <div class="card-body" :class="bodyClass">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    padding: {
      type: String,
      default: 'normal',
      validator: (value) => ['none', 'small', 'normal', 'large'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'secondary', 'light', 'dark'].includes(value)
    },
    bodyClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    classes() {
      return [
        `padding-${this.padding}`,
        `variant-${this.variant}`
      ]
    }
  }
}
</script>

<style scoped>
.base-card {
  background-color: #1E1E1E;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Padding variants */
.base-card.padding-none .card-body {
  padding: 0;
}

.base-card.padding-small .card-body {
  padding: 8px;
}

.base-card.padding-normal .card-body {
  padding: 16px;
}

.base-card.padding-large .card-body {
  padding: 24px;
}

/* Color variants */
.base-card.variant-default {
  background-color: #1E1E1E;
}

.base-card.variant-primary {
  background-color: rgba(255, 64, 129, 0.1);
  border: 1px solid rgba(255, 64, 129, 0.2);
}

.base-card.variant-secondary {
  background-color: rgba(145, 70, 255, 0.1);
  border: 1px solid rgba(145, 70, 255, 0.2);
}

.base-card.variant-light {
  background-color: #2D2D2D;
}

.base-card.variant-dark {
  background-color: #121212;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #333;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-header-actions {
  display: flex;
  gap: 8px;
}

.card-body {
  flex-grow: 1;
}

.card-footer {
  padding: 16px;
  border-top: 1px solid #333;
}
</style>
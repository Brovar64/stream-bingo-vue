<template>
  <div class="app-container min-h-screen bg-background-dark text-white font-sans">
    <!-- Global Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-background-dark bg-opacity-80 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="spinner mb-4"></div>
        <h2 class="text-xl font-semibold">Loading...</h2>
        <p>Please wait while we set things up.</p>
      </div>
    </div>
    
    <!-- Global Notification Component -->
    <Notification />
    
    <!-- Main Content -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { ref, provide, onMounted } from 'vue'
import Notification from '@/components/common/Notification.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  components: {
    Notification
  },
  setup() {
    const isLoading = ref(true)
    const authStore = useAuthStore()
    
    // Provide loading state to all components
    provide('isLoading', isLoading)
    
    onMounted(async () => {
      // Initialize auth state
      await authStore.initialize()
      
      // Stop global loading
      setTimeout(() => {
        isLoading.value = false
      }, 500)
    })
    
    return {
      isLoading
    }
  }
}
</script>

<style>
/* Global styles */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 64, 129, 0.1);
  border-radius: 50%;
  border-top-color: #FF4081;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

body {
  @apply bg-background-dark;
  margin: 0;
  padding: 0;
}

/* Apply custom styling to buttons */
.btn {
  @apply px-4 py-2 rounded font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary hover:bg-primary-dark text-white;
}

.btn-secondary {
  @apply bg-secondary hover:bg-secondary-dark text-white;
}

.container {
  @apply max-w-6xl mx-auto px-4 py-6;
}

.card {
  @apply bg-background-card rounded-lg p-5 shadow-lg;
}

.title {
  @apply text-3xl font-bold text-primary mb-4;
}

.subtitle {
  @apply text-lg text-gray-300 mb-6;
}

.form-group {
  @apply mb-4;
}

.form-control {
  @apply bg-background-lighter border border-gray-700 rounded px-3 py-2 w-full text-white;
}

label {
  @apply block text-gray-300 mb-1;
}
</style>
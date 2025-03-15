<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="title">Dashboard</h1>
      <div class="flex space-x-4">
        <router-link to="/word-sets" class="btn bg-primary hover:bg-primary-dark text-white">
          Manage Word Sets
        </router-link>
        <div class="dropdown relative group">
          <button class="btn bg-background-lighter hover:bg-gray-700 text-white">
            Manage Punishment Sets ▼
          </button>
          <div class="dropdown-menu hidden group-hover:block absolute bg-background-card rounded shadow-lg py-2 z-50 right-0">
            <router-link 
              to="/punishment-sets/player" 
              class="block px-4 py-2 hover:bg-background-lighter"
            >
              Player Punishments
            </router-link>
            <router-link 
              to="/punishment-sets/creator" 
              class="block px-4 py-2 hover:bg-background-lighter"
            >
              Creator Punishments
            </router-link>
          </div>
        </div>
        <button @click="logout" class="btn bg-background-lighter hover:bg-gray-700 text-white">
          Logout
        </button>
      </div>
    </div>
    
    <!-- Rest of the dashboard remains the same -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Existing content -->
      <!-- ... -->
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    
    function logout() {
      authStore.logout()
      router.push('/')
    }
    
    return {
      logout
    }
  }
}
</script>

<style scoped>
.dropdown .dropdown-menu {
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
}
</style>

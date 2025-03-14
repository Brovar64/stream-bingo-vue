<template>
  <div class="notifications-container">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`, {'notification-visible': notification.visible}]"
        @click="hideNotification(notification.id)"
      >
        <div class="flex items-center">
          <span v-if="notification.type === 'success'" class="notification-icon">✓</span>
          <span v-else-if="notification.type === 'error'" class="notification-icon">✗</span>
          <span v-else-if="notification.type === 'warning'" class="notification-icon">⚠</span>
          <span v-else class="notification-icon">ℹ</span>
          
          <span class="notification-message">{{ notification.message }}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'AppNotification',
  setup() {
    const notificationStore = useNotificationStore()
    const notifications = computed(() => notificationStore.notifications)
    
    function hideNotification(id) {
      notificationStore.hideNotification(id)
    }
    
    return {
      notifications,
      hideNotification
    }
  }
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  pointer-events: none;
}

.notification {
  background-color: #1E1E1E;
  color: white;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
  pointer-events: auto;
  width: 90%;
  max-width: 450px;
  border-left: 4px solid #FF4081;
}

.notification-visible {
  transform: translateY(0);
  opacity: 1;
}

.notification-success {
  border-left-color: #4CAF50;
}

.notification-error {
  border-left-color: #F44336;
}

.notification-warning {
  border-left-color: #FFA000;
}

.notification-info {
  border-left-color: #2196F3;
}

.notification-icon {
  margin-right: 10px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-message {
  flex: 1;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
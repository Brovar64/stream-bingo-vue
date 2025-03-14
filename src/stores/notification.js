import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const notificationId = ref(0)
  
  /**
   * Show a notification
   * @param {string} message - The notification message
   * @param {string} type - Type of notification: 'info', 'success', 'error', 'warning'
   * @param {number} timeout - Time in ms before automatically hiding (default: 3000ms)
   */
  function showNotification(message, type = 'info', timeout = 3000) {
    // Create a unique ID for this notification
    const id = notificationId.value++
    
    // Add notification to the array
    notifications.value.push({
      id,
      message,
      type,
      visible: true,
      timeout
    })
    
    // Auto-hide notification after timeout
    if (timeout > 0) {
      setTimeout(() => {
        hideNotification(id)
      }, timeout)
    }
    
    return id
  }
  
  /**
   * Hide a specific notification
   * @param {number} id - The notification ID to hide
   */
  function hideNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      // First set visible to false for animation
      notifications.value[index].visible = false
      
      // Remove after animation completes
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id)
      }, 300)
    }
  }
  
  /**
   * Clear all notifications
   */
  function clearNotifications() {
    notifications.value = []
  }
  
  return {
    // State
    notifications,
    
    // Actions
    showNotification,
    hideNotification,
    clearNotifications
  }
})

<template>
  <div class="container py-8">
    <h1>Modal Debug View</h1>
    
    <div class="mb-4">
      <button @click="showModal = true" class="btn btn-primary">Show Modal</button>
    </div>
    
    <div v-if="showModal" class="modal-debug">
      <div class="modal-overlay" @click="showModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Test Modal</h2>
          <button @click="showModal = false">Close</button>
        </div>
        <div class="modal-body">
          <p>This is a test modal. If you can see this, modals are working correctly.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'SetDebugView',
  
  setup() {
    const showModal = ref(false)
    
    return {
      showModal
    }
  }
}
</script>

<style scoped>
.modal-debug {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
  position: relative;
  background-color: #1E1E1E;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
  z-index: 101;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>

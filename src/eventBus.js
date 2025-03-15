// Simple event bus for Vue 3
import mitt from 'mitt'

// Create a mitt instance
const emitter = mitt()

// Export the event bus
export default emitter
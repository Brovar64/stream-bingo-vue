<template>
  <div class="card p-4">
    <h2 class="text-xl font-semibold mb-4">Classic Bingo Words</h2>
    <div class="mb-4">
      <label for="wordSetName" class="block text-sm text-gray-400 mb-1">Word Set Name</label>
      <input 
        type="text" 
        id="wordSetName" 
        v-model="setName" 
        class="form-control w-full"
        placeholder="e.g., Stream Catchphrases"
      >
    </div>
    
    <button 
      @click="openCreateModal" 
      class="btn btn-primary w-full"
      :disabled="!setName.trim()"
    >
      Create Word Set
    </button>
  </div>
</template>

<script>
export default {
  name: 'CreateWordSetPanel',
  
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  
  emits: ['update:modelValue', 'create'],
  
  data() {
    return {
      setName: this.modelValue
    }
  },
  
  watch: {
    modelValue(newVal) {
      this.setName = newVal;
    },
    
    setName(newVal) {
      this.$emit('update:modelValue', newVal);
    }
  },
  
  methods: {
    openCreateModal() {
      if (!this.setName.trim()) return;
      console.log('CreateWordSetPanel: Emitting create event with type:', 'word');
      this.$emit('create', 'word');
    }
  }
}
</script>
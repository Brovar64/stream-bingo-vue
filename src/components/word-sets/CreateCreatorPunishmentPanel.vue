<template>
  <div class="card p-4">
    <h2 class="text-xl font-semibold mb-4">Creator Punishments</h2>
    <div class="mb-4">
      <label for="creatorPunishmentSetName" class="block text-sm text-gray-400 mb-1">Punishment Set Name</label>
      <input 
        type="text" 
        id="creatorPunishmentSetName" 
        v-model="setName" 
        class="form-control w-full"
        placeholder="e.g., Streamer Challenges"
      >
    </div>
    
    <button 
      @click="openCreateModal" 
      class="btn btn-primary w-full"
      :disabled="!setName.trim()"
    >
      Create Creator Punishments
    </button>
  </div>
</template>

<script>
export default {
  name: 'CreateCreatorPunishmentPanel',
  
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
      console.log('CreateCreatorPunishmentPanel: Emitting create event with type:', 'creatorPunishment');
      this.$emit('create', 'creatorPunishment');
    }
  }
}
</script>
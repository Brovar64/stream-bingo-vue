<template>
  <div class="mb-6">
    <h3 class="text-md font-semibold mb-2">Use Punishment Sets</h3>
    <div class="space-y-3">
      <!-- Creator Punishments -->
      <div class="form-group">
        <label class="text-sm">Creator Punishments</label>
        <select v-model="selectedCreatorSet" class="form-control">
          <option value="">Select a set...</option>
          <option v-for="(set, index) in creatorSets" :key="`creator-${index}`" :value="index">
            {{ set.name }} ({{ set.items.length }})
          </option>
        </select>
      </div>
      
      <button 
        @click="applyCreatorSet" 
        class="btn bg-blue-600 hover:bg-blue-700 text-white w-full"
        :disabled="selectedCreatorSet === ''"
      >
        Apply to Creator Side
      </button>
      
      <!-- Player Punishments -->
      <div class="form-group mt-4">
        <label class="text-sm">Player Punishments</label>
        <select v-model="selectedPlayerSet" class="form-control">
          <option value="">Select a set...</option>
          <option v-for="(set, index) in playerSets" :key="`player-${index}`" :value="index">
            {{ set.name }} ({{ set.items.length }})
          </option>
        </select>
      </div>
      
      <button 
        @click="applyPlayerSet" 
        class="btn bg-green-600 hover:bg-green-700 text-white w-full"
        :disabled="selectedPlayerSet === ''"
      >
        Apply to Player Side
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PunishmentSetSelector',
  props: {
    creatorSets: {
      type: Array,
      default: () => []
    },
    playerSets: {
      type: Array,
      default: () => []
    }
  },
  emits: ['apply-creator-set', 'apply-player-set'],
  data() {
    return {
      selectedCreatorSet: '',
      selectedPlayerSet: ''
    }
  },
  methods: {
    applyCreatorSet() {
      if (this.selectedCreatorSet === '') return
      
      const setIndex = parseInt(this.selectedCreatorSet)
      if (isNaN(setIndex) || !this.creatorSets[setIndex]) return
      
      this.$emit('apply-creator-set', setIndex)
      
      // Reset selection after applying
      this.selectedCreatorSet = ''
    },
    
    applyPlayerSet() {
      if (this.selectedPlayerSet === '') return
      
      const setIndex = parseInt(this.selectedPlayerSet)
      if (isNaN(setIndex) || !this.playerSets[setIndex]) return
      
      this.$emit('apply-player-set', setIndex)
      
      // Reset selection after applying
      this.selectedPlayerSet = ''
    }
  }
}
</script>

<style scoped>
/* Any component-specific styles can be added here */
</style>

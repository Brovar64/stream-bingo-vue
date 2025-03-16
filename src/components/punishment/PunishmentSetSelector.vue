<template>
  <div class="mb-6">
    <h3 class="text-md font-semibold mb-2">Use Punishment Sets</h3>
    <div class="space-y-3">
      <!-- Creator Punishments -->
      <div class="form-group">
        <label class="text-sm">Creator Punishments</label>
        <select v-model="selectedCreatorSet" class="form-control">
          <option value="">Select a set...</option>
          <option v-for="set in creatorSets" :key="set.id" :value="set.id">
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
          <option v-for="set in playerSets" :key="set.id" :value="set.id">
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
  created() {
    console.log('PunishmentSetSelector created with:', {
      creatorSets: this.creatorSets.length,
      playerSets: this.playerSets.length
    });
    
    if (this.creatorSets.length > 0) {
      console.log('Creator sets sample:', this.creatorSets[0]);
    }
    
    if (this.playerSets.length > 0) {
      console.log('Player sets sample:', this.playerSets[0]);
    }
  },
  methods: {
    applyCreatorSet() {
      if (this.selectedCreatorSet === '') return;
      
      console.log('Applying creator set with ID:', this.selectedCreatorSet);
      
      // Find the set with this ID
      const selectedSet = this.creatorSets.find(set => set.id === this.selectedCreatorSet);
      
      if (!selectedSet) {
        console.error('Could not find creator set with ID:', this.selectedCreatorSet);
        return;
      }
      
      console.log('Found set:', selectedSet.name, 'with', selectedSet.items.length, 'items');
      
      // Emit the event with the selected set id
      this.$emit('apply-creator-set', this.selectedCreatorSet);
      
      // Reset selection after applying
      this.selectedCreatorSet = '';
    },
    
    applyPlayerSet() {
      if (this.selectedPlayerSet === '') return;
      
      console.log('Applying player set with ID:', this.selectedPlayerSet);
      
      // Find the set with this ID
      const selectedSet = this.playerSets.find(set => set.id === this.selectedPlayerSet);
      
      if (!selectedSet) {
        console.error('Could not find player set with ID:', this.selectedPlayerSet);
        return;
      }
      
      console.log('Found set:', selectedSet.name, 'with', selectedSet.items.length, 'items');
      
      // Emit the event with the selected set id
      this.$emit('apply-player-set', this.selectedPlayerSet);
      
      // Reset selection after applying
      this.selectedPlayerSet = '';
    }
  }
}
</script>

<style scoped>
/* Any component-specific styles can be added here */
</style>

<template>
  <div>
    <!-- Management Tabs -->
    <div class="tab-container mb-6">
      <button 
        @click="activeTab = 'words'" 
        :class="['tab-button', activeTab === 'words' ? 'active' : '']"
      >
        Bingo Words
      </button>
      <button 
        @click="activeTab = 'playerPunishments'" 
        :class="['tab-button', activeTab === 'playerPunishments' ? 'active' : '']"
      >
        Player Punishments
      </button>
      <button 
        @click="activeTab = 'creatorPunishments'" 
        :class="['tab-button', activeTab === 'creatorPunishments' ? 'active' : '']"
      >
        Creator Punishments
      </button>
    </div>
    
    <!-- Word Sets List -->
    <div v-if="activeTab === 'words'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-if="wordSets.length === 0" class="col-span-3 card p-6 flex flex-col items-center justify-center">
        <div class="text-gray-400 mb-3">No word sets created yet</div>
        <p class="text-sm text-gray-500">Create your first word set to get started!</p>
      </div>
      
      <div v-for="(wordSet, index) in wordSets" :key="index" class="card p-4">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold">{{ wordSet.name }}</h3>
          <div class="flex space-x-2">
            <button 
              @click="editWordSet(index)" 
              class="text-primary hover:text-primary-light" 
              title="Edit"
            >
              ✏️
            </button>
            <button 
              @click="deleteWordSet(index)" 
              class="text-error hover:text-red-400" 
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="text-sm text-gray-400 mb-2">{{ wordSet.words.length }} words</div>
        
        <div class="max-h-32 overflow-y-auto bg-background-lighter p-2 rounded mb-3">
          <div v-for="(word, wordIndex) in wordSet.words.slice(0, 5)" :key="wordIndex" class="text-sm mb-1">
            {{ word }}
          </div>
          <div v-if="wordSet.words.length > 5" class="text-xs text-gray-500 italic">
            And {{ wordSet.words.length - 5 }} more...
          </div>
        </div>
        
        <button 
          @click="viewWordSet(index)" 
          class="btn bg-background-lighter hover:bg-gray-700 text-white w-full"
        >
          View Details
        </button>
      </div>
    </div>
    
    <!-- Player Punishment Sets List -->
    <div v-if="activeTab === 'playerPunishments'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-if="playerPunishmentSets.length === 0" class="col-span-3 card p-6 flex flex-col items-center justify-center">
        <div class="text-gray-400 mb-3">No player punishment sets created yet</div>
        <p class="text-sm text-gray-500">Create your first player punishment set to get started!</p>
      </div>
      
      <div v-for="(punishmentSet, index) in playerPunishmentSets" :key="index" class="card p-4">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold">{{ punishmentSet.name }}</h3>
          <div class="flex space-x-2">
            <button 
              @click="editPunishmentSet('player', index)" 
              class="text-primary hover:text-primary-light" 
              title="Edit"
            >
              ✏️
            </button>
            <button 
              @click="deletePunishmentSet('player', index)" 
              class="text-error hover:text-red-400" 
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="text-sm text-gray-400 mb-2">{{ punishmentSet.entries.length }} punishments</div>
        
        <div class="max-h-32 overflow-y-auto bg-background-lighter p-2 rounded mb-3">
          <div v-for="(entry, entryIndex) in punishmentSet.entries.slice(0, 3)" :key="entryIndex" class="text-sm mb-2">
            <div class="font-medium">{{ entry.phrase }}</div>
            <div class="text-xs italic text-gray-400">{{ entry.punishment }}</div>
          </div>
          <div v-if="punishmentSet.entries.length > 3" class="text-xs text-gray-500 italic">
            And {{ punishmentSet.entries.length - 3 }} more...
          </div>
        </div>
        
        <button 
          @click="viewPunishmentSet('player', index)" 
          class="btn bg-background-lighter hover:bg-gray-700 text-white w-full"
        >
          View Details
        </button>
      </div>
    </div>
    
    <!-- Creator Punishment Sets List -->
    <div v-if="activeTab === 'creatorPunishments'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-if="creatorPunishmentSets.length === 0" class="col-span-3 card p-6 flex flex-col items-center justify-center">
        <div class="text-gray-400 mb-3">No creator punishment sets created yet</div>
        <p class="text-sm text-gray-500">Create your first creator punishment set to get started!</p>
      </div>
      
      <div v-for="(punishmentSet, index) in creatorPunishmentSets" :key="index" class="card p-4">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold">{{ punishmentSet.name }}</h3>
          <div class="flex space-x-2">
            <button 
              @click="editPunishmentSet('creator', index)" 
              class="text-primary hover:text-primary-light" 
              title="Edit"
            >
              ✏️
            </button>
            <button 
              @click="deletePunishmentSet('creator', index)" 
              class="text-error hover:text-red-400" 
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="text-sm text-gray-400 mb-2">{{ punishmentSet.entries.length }} punishments</div>
        
        <div class="max-h-32 overflow-y-auto bg-background-lighter p-2 rounded mb-3">
          <div v-for="(entry, entryIndex) in punishmentSet.entries.slice(0, 3)" :key="entryIndex" class="text-sm mb-2">
            <div class="font-medium">{{ entry.phrase }}</div>
            <div class="text-xs italic text-gray-400">{{ entry.punishment }}</div>
          </div>
          <div v-if="punishmentSet.entries.length > 3" class="text-xs text-gray-500 italic">
            And {{ punishmentSet.entries.length - 3 }} more...
          </div>
        </div>
        
        <button 
          @click="viewPunishmentSet('creator', index)" 
          class="btn bg-background-lighter hover:bg-gray-700 text-white w-full"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetsManager',
  
  props: {
    wordSets: {
      type: Array,
      default: () => []
    },
    playerPunishmentSets: {
      type: Array,
      default: () => []
    },
    creatorPunishmentSets: {
      type: Array,
      default: () => []
    },
    initialTab: {
      type: String,
      default: 'words'
    }
  },
  
  emits: ['view-word-set', 'edit-word-set', 'delete-word-set', 
         'view-punishment-set', 'edit-punishment-set', 'delete-punishment-set',
         'update:activeTab'],
  
  data() {
    return {
      activeTab: this.initialTab
    };
  },
  
  watch: {
    initialTab(newTab) {
      this.activeTab = newTab;
    },
    
    activeTab(newTab) {
      this.$emit('update:activeTab', newTab);
    }
  },
  
  methods: {
    // Word set operations
    viewWordSet(index) {
      this.$emit('view-word-set', index);
    },
    
    editWordSet(index) {
      this.$emit('edit-word-set', index);
    },
    
    deleteWordSet(index) {
      this.$emit('delete-word-set', index);
    },
    
    // Punishment set operations
    viewPunishmentSet(type, index) {
      this.$emit('view-punishment-set', { type, index });
    },
    
    editPunishmentSet(type, index) {
      this.$emit('edit-punishment-set', { type, index });
    },
    
    deletePunishmentSet(type, index) {
      this.$emit('delete-punishment-set', { type, index });
    }
  }
}
</script>

<style scoped>
.tab-container {
  @apply flex space-x-2;
}

.tab-button {
  @apply px-4 py-2 rounded-lg bg-background-lighter hover:bg-gray-700 transition-colors;
}

.tab-button.active {
  @apply bg-primary text-white;
}
</style>

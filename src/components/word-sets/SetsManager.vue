<template>
  <div>
    <!-- Management Tabs -->
    <BaseTabs
      v-model="activeTab"
      :tabs="tabOptions"
      class="mb-6"
      @tab-change="handleTabChange"
    >
      <!-- Tab content is rendered outside the tabs component -->
    </BaseTabs>

    <!-- Word Sets List -->
    <div v-if="activeTab === 'words'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-if="wordSets.length === 0" class="col-span-3">
        <BaseCard padding="large">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="text-gray-400 mb-3">No word sets created yet</div>
            <p class="text-sm text-gray-500">Create your first word set to get started!</p>
          </div>
        </BaseCard>
      </div>
      
      <BaseCard v-for="(wordSet, index) in wordSets" :key="index">
        <template #header>
          <h3 class="text-lg font-semibold">{{ wordSet.name }}</h3>
        </template>
        <template #header-actions>
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
        </template>
        
        <div class="text-sm text-gray-400 mb-2">{{ wordSet.words.length }} words</div>
        
        <BaseCard variant="light" padding="small" bodyClass="max-h-32 overflow-y-auto">
          <div v-for="(word, wordIndex) in wordSet.words.slice(0, 5)" :key="wordIndex" class="text-sm mb-1">
            {{ word }}
          </div>
          <div v-if="wordSet.words.length > 5" class="text-xs text-gray-500 italic">
            And {{ wordSet.words.length - 5 }} more...
          </div>
        </BaseCard>
        
        <template #footer>
          <button 
            @click="viewWordSet(index)" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white w-full"
          >
            View Details
          </button>
        </template>
      </BaseCard>
    </div>
    
    <!-- Player Punishment Sets List -->
    <div v-if="activeTab === 'playerPunishments'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-if="playerPunishmentSets.length === 0" class="col-span-3">
        <BaseCard padding="large">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="text-gray-400 mb-3">No player punishment sets created yet</div>
            <p class="text-sm text-gray-500">Create your first player punishment set to get started!</p>
          </div>
        </BaseCard>
      </div>
      
      <BaseCard v-for="(punishmentSet, index) in playerPunishmentSets" :key="index">
        <template #header>
          <h3 class="text-lg font-semibold">{{ punishmentSet.name }}</h3>
        </template>
        <template #header-actions>
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
        </template>
        
        <div class="text-sm text-gray-400 mb-2">{{ punishmentSet.entries.length }} punishments</div>
        
        <BaseCard variant="light" padding="small" bodyClass="max-h-32 overflow-y-auto">
          <div v-for="(entry, entryIndex) in punishmentSet.entries.slice(0, 3)" :key="entryIndex" class="text-sm mb-2">
            <div class="font-medium">{{ entry.phrase }}</div>
            <div class="text-xs italic text-gray-400">{{ entry.punishment }}</div>
          </div>
          <div v-if="punishmentSet.entries.length > 3" class="text-xs text-gray-500 italic">
            And {{ punishmentSet.entries.length - 3 }} more...
          </div>
        </BaseCard>
        
        <template #footer>
          <button 
            @click="viewPunishmentSet('player', index)" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white w-full"
          >
            View Details
          </button>
        </template>
      </BaseCard>
    </div>
    
    <!-- Creator Punishment Sets List -->
    <div v-if="activeTab === 'creatorPunishments'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-if="creatorPunishmentSets.length === 0" class="col-span-3">
        <BaseCard padding="large">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="text-gray-400 mb-3">No creator punishment sets created yet</div>
            <p class="text-sm text-gray-500">Create your first creator punishment set to get started!</p>
          </div>
        </BaseCard>
      </div>
      
      <BaseCard v-for="(punishmentSet, index) in creatorPunishmentSets" :key="index">
        <template #header>
          <h3 class="text-lg font-semibold">{{ punishmentSet.name }}</h3>
        </template>
        <template #header-actions>
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
        </template>
        
        <div class="text-sm text-gray-400 mb-2">{{ punishmentSet.entries.length }} punishments</div>
        
        <BaseCard variant="light" padding="small" bodyClass="max-h-32 overflow-y-auto">
          <div v-for="(entry, entryIndex) in punishmentSet.entries.slice(0, 3)" :key="entryIndex" class="text-sm mb-2">
            <div class="font-medium">{{ entry.phrase }}</div>
            <div class="text-xs italic text-gray-400">{{ entry.punishment }}</div>
          </div>
          <div v-if="punishmentSet.entries.length > 3" class="text-xs text-gray-500 italic">
            And {{ punishmentSet.entries.length - 3 }} more...
          </div>
        </BaseCard>
        
        <template #footer>
          <button 
            @click="viewPunishmentSet('creator', index)" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white w-full"
          >
            View Details
          </button>
        </template>
      </BaseCard>
    </div>
  </div>
</template>

<script>
import BaseTabs from '@/components/base/BaseTabs.vue';
import BaseCard from '@/components/base/BaseCard.vue';

export default {
  name: 'SetsManager',
  components: {
    BaseTabs,
    BaseCard
  },
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
  
  computed: {
    tabOptions() {
      return [
        { value: 'words', label: 'Bingo Words' },
        { value: 'playerPunishments', label: 'Player Punishments' },
        { value: 'creatorPunishments', label: 'Creator Punishments' }
      ];
    }
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
    handleTabChange(tabValue) {
      this.activeTab = tabValue;
    },
    
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

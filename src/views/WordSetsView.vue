
<template>
  <div class="container py-8">
    <h1 class="title mb-8">Manage Sets</h1>
    
    <div v-if="loading" class="text-center py-16">
      <div class="spinner mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold">Loading Sets</h2>
      <p class="text-gray-400">Please wait...</p>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Bingo Words Set Column -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Bingo Words Sets</h2>
            <button 
              @click="startCreateSet('word')" 
              class="btn btn-primary text-sm py-1 px-2"
              :disabled="!wordSetStore.canCreateWordSet"
              :class="{'bg-gray-600 cursor-not-allowed': !wordSetStore.canCreateWordSet}"
              :title="!wordSetStore.canCreateWordSet ? `Maximum ${wordSetStore.MAX_SETS_PER_TYPE} sets reached` : ''"
            >
              Create Word Set
            </button>
          </div>
          
          <div v-if="wordSetStore.wordSets.length === 0" class="text-center py-4 text-gray-400">
            No word sets created yet.
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="set in wordSetStore.wordSets" 
              :key="set.id" 
              class="bg-background-lighter p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <div class="font-medium">{{ set.name }}</div>
                <div class="text-xs text-gray-400">{{ set.items.length }} words</div>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="editSet(set, 'word')" 
                  class="text-primary hover:text-primary-light"
                >
                  ✏️
                </button>
                <button 
                  @click="deleteSet(set.id, 'Word')" 
                  class="text-error hover:text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="wordSetStore.wordSetCount >= wordSetStore.MAX_SETS_PER_TYPE" class="mt-3 text-center text-xs text-warning">
            Set limit reached ({{ wordSetStore.wordSetCount }}/{{ wordSetStore.MAX_SETS_PER_TYPE }})
          </div>
        </div>
        
        <!-- Player Punishment Set Column -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Player Punishment Sets</h2>
            <button 
              @click="startCreateSet('playerPunishment')" 
              class="btn btn-primary text-sm py-1 px-2"
              :disabled="!wordSetStore.canCreatePlayerPunishmentSet"
              :class="{'bg-gray-600 cursor-not-allowed': !wordSetStore.canCreatePlayerPunishmentSet}"
              :title="!wordSetStore.canCreatePlayerPunishmentSet ? `Maximum ${wordSetStore.MAX_SETS_PER_TYPE} sets reached` : ''"
            >
              Create Player Set
            </button>
          </div>
          
          <div v-if="wordSetStore.playerPunishmentSets.length === 0" class="text-center py-4 text-gray-400">
            No player punishment sets created yet.
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="set in wordSetStore.playerPunishmentSets" 
              :key="set.id" 
              class="bg-background-lighter p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <div class="font-medium">{{ set.name }}</div>
                <div class="text-xs text-gray-400">{{ set.items.length }} punishments</div>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="editSet(set, 'playerPunishment')" 
                  class="text-primary hover:text-primary-light"
                >
                  ✏️
                </button>
                <button 
                  @click="deleteSet(set.id, 'Player Punishment')" 
                  class="text-error hover:text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="wordSetStore.playerPunishmentSetCount >= wordSetStore.MAX_SETS_PER_TYPE" class="mt-3 text-center text-xs text-warning">
            Set limit reached ({{ wordSetStore.playerPunishmentSetCount }}/{{ wordSetStore.MAX_SETS_PER_TYPE }})
          </div>
        </div>
        
        <!-- Creator Punishment Set Column -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Creator Punishment Sets</h2>
            <button 
              @click="startCreateSet('creatorPunishment')" 
              class="btn btn-primary text-sm py-1 px-2"
              :disabled="!wordSetStore.canCreateCreatorPunishmentSet"
              :class="{'bg-gray-600 cursor-not-allowed': !wordSetStore.canCreateCreatorPunishmentSet}"
              :title="!wordSetStore.canCreateCreatorPunishmentSet ? `Maximum ${wordSetStore.MAX_SETS_PER_TYPE} sets reached` : ''"
            >
              Create Creator Set
            </button>
          </div>
          
          <div v-if="wordSetStore.creatorPunishmentSets.length === 0" class="text-center py-4 text-gray-400">
            No creator punishment sets created yet.
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="set in wordSetStore.creatorPunishmentSets" 
              :key="set.id" 
              class="bg-background-lighter p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <div class="font-medium">{{ set.name }}</div>
                <div class="text-xs text-gray-400">{{ set.items.length }} punishments</div>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="editSet(set, 'creatorPunishment')" 
                  class="text-primary hover:text-primary-light"
                >
                  ✏️
                </button>
                <button 
                  @click="deleteSet(set.id, 'Creator Punishment')" 
                  class="text-error hover:text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="wordSetStore.creatorPunishmentSetCount >= wordSetStore.MAX_SETS_PER_TYPE" class="mt-3 text-center text-xs text-warning">
            Set limit reached ({{ wordSetStore.creatorPunishmentSetCount }}/{{ wordSetStore.MAX_SETS_PER_TYPE }})
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal for Creating/Editing Sets -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">
            {{ isEditing ? 'Edit' : 'Create' }} {{ getSetTypeLabel(currentSetType) }} Set
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Set Name</label>
          <input 
            type="text" 
            v-model="newSetName" 
            class="form-control w-full"
            :placeholder="`Enter ${getSetTypeLabel(currentSetType).toLowerCase()} set name`"
          >
        </div>
        
        <div class="mb-6">
          <div class="flex justify-between mb-2">
            <label class="block text-sm text-gray-400">Enter Items</label>
            <span class="text-xs text-gray-400">
              {{ parsedItems.length }}/{{ wordSetStore.MAX_ITEMS_PER_SET }} items
            </span>
          </div>
          <textarea 
            v-model="itemInput" 
            class="form-control w-full h-48 font-mono"
            :placeholder="`Enter each ${currentSetType === 'word' ? 'word' : 'punishment'} on a new line`"
          ></textarea>
          <div v-if="parsedItems.length > wordSetStore.MAX_ITEMS_PER_SET" class="text-xs text-warning mt-1">
            Only the first {{ wordSetStore.MAX_ITEMS_PER_SET }} items will be saved
          </div>
        </div>
        
        <div class="flex justify-between items-center mb-6">
          <div>
            <label for="fileInput" class="btn bg-background-lighter hover:bg-gray-700 text-white cursor-pointer">
              Import from TXT File
            </label>
            <input 
              type="file" 
              id="fileInput" 
              accept=".txt" 
              @change="handleFileImport" 
              class="hidden"
            >
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeModal" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button 
            @click="saveSet" 
            class="btn btn-primary"
            :disabled="!newSetName.trim() || parsedItems.length === 0"
          >
            Save Set
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useWordSetStore } from '@/stores/word-sets'

export default {
  name: 'WordSetsView',
  setup() {
    const notificationStore = useNotificationStore()
    const wordSetStore = useWordSetStore()
    
    // State
    const loading = ref(true)
    const newSetName = ref('')
    const itemInput = ref('')
    const showModal = ref(false)
    const currentSetType = ref('word')
    const currentSetId = ref(null)
    
    // Computed
    const isEditing = computed(() => !!currentSetId.value)
    
    const parsedItems = computed(() => {
      if (!itemInput.value.trim()) return []
      
      // For all set types, just return the trimmed non-empty lines
      return itemInput.value
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0)
    })
    
    // Load sets on initialization
    onMounted(async () => {
      loading.value = true
      await wordSetStore.loadWordSets()
      loading.value = false
    })
    
    // Method to get user-friendly type label
    function getSetTypeLabel(type) {
      switch(type) {
        case 'word': return 'Word'
        case 'playerPunishment': return 'Player Punishment'
        case 'creatorPunishment': return 'Creator Punishment'
        default: return 'Unknown'
      }
    }
    
    // Method to start creating a set
    function startCreateSet(type) {
      currentSetType.value = type
      newSetName.value = ''
      itemInput.value = ''
      currentSetId.value = null
      showModal.value = true
    }
    
    // Method to edit a set
    function editSet(set, type) {
      currentSetType.value = type
      currentSetId.value = set.id
      newSetName.value = set.name
      
      // Format items - all sets are now simple string arrays
      itemInput.value = set.items.join('\n')
      
      showModal.value = true
    }
    
    // Method to delete a set
    async function deleteSet(setId, typeLabel) {
      if (confirm(`Are you sure you want to delete this ${typeLabel.toLowerCase()} set?`)) {
        const success = await wordSetStore.deleteWordSet(setId)
        
        if (success) {
          notificationStore.showNotification(`${typeLabel} set deleted successfully`, 'success')
        }
      }
    }
    
    // Save set
    async function saveSet() {
      if (!newSetName.value.trim() || parsedItems.value.length === 0) return
      
      try {
        console.log(`Saving ${currentSetType.value} set with ${parsedItems.value.length} items`);
        
        const setData = {
          name: newSetName.value.trim(),
          type: currentSetType.value,
          items: parsedItems.value
        };
        
        // Save to store
        const setId = await wordSetStore.saveWordSet(setData, currentSetId.value);
        
        if (setId) {
          notificationStore.showNotification(
            `${getSetTypeLabel(currentSetType.value)} set ${isEditing.value ? 'updated' : 'created'} successfully`, 
            'success'
          );
          closeModal();
        } else {
          throw new Error('Failed to save set - no set ID returned');
        }
      } catch (error) {
        console.error('Error saving set:', error);
        notificationStore.showNotification(
          `Error saving ${getSetTypeLabel(currentSetType.value)} set: ${error.message}`,
          'error'
        );
      }
    }
    
    // Handle file import
    function handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = e => {
        itemInput.value = e.target.result
      }
      reader.onerror = () => {
        notificationStore.showNotification('Failed to read file', 'error')
      }
      reader.readAsText(file)
    }
    
    // Close modal
    function closeModal() {
      showModal.value = false
      newSetName.value = ''
      itemInput.value = ''
      currentSetId.value = null
    }
    
    return {
      loading,
      wordSetStore,
      newSetName,
      itemInput,
      showModal,
      currentSetType,
      isEditing,
      parsedItems,
      getSetTypeLabel,
      startCreateSet,
      editSet,
      deleteSet,
      saveSet,
      handleFileImport,
      closeModal
    }
  }
}
</script>

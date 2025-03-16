<template>
  <div class="container py-8">
    <h1 class="title mb-8">Manage Sets</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Bingo Words Set Column -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Bingo Words Sets</h2>
          <button 
            @click="startCreateSet('Word')" 
            class="btn btn-primary text-sm py-1 px-2"
          >
            Create Word Set
          </button>
        </div>
        
        <div v-if="wordSets.length === 0" class="text-center py-4 text-gray-400">
          No word sets created yet.
        </div>
        
        <div v-else class="space-y-2">
          <div 
            v-for="(set, index) in wordSets" 
            :key="index" 
            class="bg-background-lighter p-3 rounded-lg flex justify-between items-center"
          >
            <div>
              <div class="font-medium">{{ set.name }}</div>
              <div class="text-xs text-gray-400">{{ set.items.length }} words</div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="editSet(index, 'Word')" 
                class="text-primary hover:text-primary-light"
              >
                ✏️
              </button>
              <button 
                @click="deleteSet(index, 'Word')" 
                class="text-error hover:text-red-400"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Player Punishment Set Column -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Player Punishment Sets</h2>
          <button 
            @click="startCreateSet('Player Punishment')" 
            class="btn btn-primary text-sm py-1 px-2"
          >
            Create Player Set
          </button>
        </div>
        
        <div v-if="playerPunishmentSets.length === 0" class="text-center py-4 text-gray-400">
          No player punishment sets created yet.
        </div>
        
        <div v-else class="space-y-2">
          <div 
            v-for="(set, index) in playerPunishmentSets" 
            :key="index" 
            class="bg-background-lighter p-3 rounded-lg flex justify-between items-center"
          >
            <div>
              <div class="font-medium">{{ set.name }}</div>
              <div class="text-xs text-gray-400">{{ set.items.length }} punishments</div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="editSet(index, 'Player Punishment')" 
                class="text-primary hover:text-primary-light"
              >
                ✏️
              </button>
              <button 
                @click="deleteSet(index, 'Player Punishment')" 
                class="text-error hover:text-red-400"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Creator Punishment Set Column -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Creator Punishment Sets</h2>
          <button 
            @click="startCreateSet('Creator Punishment')" 
            class="btn btn-primary text-sm py-1 px-2"
          >
            Create Creator Set
          </button>
        </div>
        
        <div v-if="creatorPunishmentSets.length === 0" class="text-center py-4 text-gray-400">
          No creator punishment sets created yet.
        </div>
        
        <div v-else class="space-y-2">
          <div 
            v-for="(set, index) in creatorPunishmentSets" 
            :key="index" 
            class="bg-background-lighter p-3 rounded-lg flex justify-between items-center"
          >
            <div>
              <div class="font-medium">{{ set.name }}</div>
              <div class="text-xs text-gray-400">{{ set.items.length }} punishments</div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="editSet(index, 'Creator Punishment')" 
                class="text-primary hover:text-primary-light"
              >
                ✏️
              </button>
              <button 
                @click="deleteSet(index, 'Creator Punishment')" 
                class="text-error hover:text-red-400"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal for Creating/Editing Sets -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">
            {{ editingIndex === -1 ? 'Create' : 'Edit' }} {{ currentSetType }} Set
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
            :placeholder="`Enter ${currentSetType} set name`"
          >
        </div>
        
        <div class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Enter Items</label>
          <textarea 
            v-model="itemInput" 
            class="form-control w-full h-48 font-mono"
            :placeholder="`Enter each ${currentSetType.toLowerCase()} item on a new line`"
          ></textarea>
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
          
          <div class="text-gray-400">
            <span class="font-bold">{{ parsedItems.length }}</span> items
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
import { ref, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'WordSetsView',
  setup() {
    const notificationStore = useNotificationStore()
    
    // State
    const wordSets = ref([])
    const playerPunishmentSets = ref([])
    const creatorPunishmentSets = ref([])
    const newSetName = ref('')
    const itemInput = ref('')
    const showModal = ref(false)
    const currentSetType = ref('Word')
    const editingIndex = ref(-1)
    
    // Load sets from local storage on initialization
    function loadSets() {
      const storedWordSets = localStorage.getItem('wordSets')
      const storedPlayerPunishmentSets = localStorage.getItem('playerPunishmentSets')
      const storedCreatorPunishmentSets = localStorage.getItem('creatorPunishmentSets')
      
      wordSets.value = storedWordSets ? JSON.parse(storedWordSets) : []
      playerPunishmentSets.value = storedPlayerPunishmentSets ? JSON.parse(storedPlayerPunishmentSets) : []
      creatorPunishmentSets.value = storedCreatorPunishmentSets ? JSON.parse(storedCreatorPunishmentSets) : []
    }
    
    // Computed
    const parsedItems = computed(() => {
      if (!itemInput.value.trim()) return []
      return itemInput.value
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0)
    })
    
    // Method to start creating a set
    function startCreateSet(type) {
      currentSetType.value = type
      newSetName.value = ''
      itemInput.value = ''
      editingIndex.value = -1
      showModal.value = true
    }
    
    // Method to edit a set
    function editSet(index, type) {
      currentSetType.value = type
      editingIndex.value = index
      
      const sets = getSetsForType(type)
      const set = sets[index]
      
      newSetName.value = set.name
      itemInput.value = set.items.join('\n')
      showModal.value = true
    }
    
    // Method to delete a set
    function deleteSet(index, type) {
      if (confirm(`Are you sure you want to delete this ${type.toLowerCase()} set?`)) {
        const sets = getSetsForType(type)
        const name = sets[index].name
        
        sets.splice(index, 1)
        
        saveSets(type)
        notificationStore.showNotification(`${type} set "${name}" deleted`, 'success')
      }
    }
    
    // Save sets to local storage
    function saveSets(type) {
      const storageKey = `${type.toLowerCase().replaceAll(' ', '')}Sets`
      const sets = getSetsForType(type)
      localStorage.setItem(storageKey, JSON.stringify(sets))
    }
    
    // Get the correct sets array based on type
    function getSetsForType(type) {
      switch(type) {
        case 'Word': return wordSets.value
        case 'Player Punishment': return playerPunishmentSets.value
        case 'Creator Punishment': return creatorPunishmentSets.value
        default: return []
      }
    }
    
    // Method to save a new or edited set
    function saveSet() {
      if (!newSetName.value.trim() || parsedItems.value.length === 0) return
      
      const sets = getSetsForType(currentSetType.value)
      
      const newSet = {
        name: newSetName.value.trim(),
        items: [...parsedItems.value],
        createdAt: new Date().toISOString()
      }
      
      if (editingIndex.value === -1) {
        // Creating new set
        sets.push(newSet)
        notificationStore.showNotification(`${currentSetType.value} set created successfully`, 'success')
      } else {
        // Updating existing set
        sets[editingIndex.value] = {
          ...newSet,
          updatedAt: new Date().toISOString()
        }
        notificationStore.showNotification(`${currentSetType.value} set updated successfully`, 'success')
      }
      
      saveSets(currentSetType.value)
      closeModal()
    }
    
    // Method to handle file import
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
      editingIndex.value = -1
    }
    
    // Load sets on initialization
    loadSets()
    
    return {
      wordSets,
      playerPunishmentSets,
      creatorPunishmentSets,
      newSetName,
      itemInput,
      showModal,
      currentSetType,
      editingIndex,
      parsedItems,
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

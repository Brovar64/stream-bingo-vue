<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="title">Manage Sets</h1>
      <div class="flex items-center space-x-4">
        <select 
          v-model="currentSetType" 
          class="form-control"
        >
          <option value="Word">Bingo Words</option>
          <option value="Player Punishment">Player Punishments</option>
          <option value="Creator Punishment">Creator Punishments</option>
        </select>
        <button 
          @click="startCreateSet" 
          class="btn btn-primary"
        >
          Create New {{ currentSetType }} Set
        </button>
      </div>
    </div>
    
    <!-- Sets List -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div v-if="sets.length === 0" class="col-span-full card p-6 flex flex-col items-center justify-center">
        <div class="text-gray-400 mb-3">No {{ currentSetType.toLowerCase() }} sets created yet</div>
        <p class="text-sm text-gray-500">Create your first {{ currentSetType.toLowerCase() }} set to get started!</p>
      </div>
      
      <div v-else v-for="(set, index) in sets" :key="index" class="card p-4">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold">{{ set.name }}</h3>
          <div class="flex space-x-2">
            <button 
              @click="editSet(index)" 
              class="text-primary hover:text-primary-light" 
              title="Edit"
            >
              ✏️
            </button>
            <button 
              @click="deleteSet(index)" 
              class="text-error hover:text-red-400" 
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="text-sm text-gray-400 mb-2">{{ set.items.length }} items</div>
        
        <div class="max-h-32 overflow-y-auto bg-background-lighter p-2 rounded mb-3">
          <div v-for="(item, itemIndex) in set.items.slice(0, 5)" :key="itemIndex" class="text-sm mb-1">
            {{ item }}
          </div>
          <div v-if="set.items.length > 5" class="text-xs text-gray-500 italic">
            And {{ set.items.length - 5 }} more...
          </div>
        </div>
        
        <button 
          @click="viewSet(index)" 
          class="btn bg-background-lighter hover:bg-gray-700 text-white w-full"
        >
          View Details
        </button>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'WordSetsView',
  setup() {
    const notificationStore = useNotificationStore()
    
    // State
    const currentSetType = ref('Word')
    const sets = ref([])
    const newSetName = ref('')
    const itemInput = ref('')
    const showModal = ref(false)
    const editingIndex = ref(-1)
    
    // Computed properties
    const parsedItems = computed(() => {
      if (!itemInput.value.trim()) return []
      return itemInput.value
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0)
    })
    
    // Watch for changes in set type
    watch(currentSetType, () => {
      loadSets()
    })
    
    // Lifecycle hooks
    onMounted(() => {
      loadSets()
    })
    
    // Methods
    function loadSets() {
      const storageKey = `${currentSetType.value.toLowerCase().replace(' ', '')}Sets`
      const storedSets = localStorage.getItem(storageKey)
      if (storedSets) {
        try {
          sets.value = JSON.parse(storedSets)
        } catch (error) {
          console.error('Failed to parse sets:', error)
          sets.value = []
        }
      } else {
        sets.value = []
      }
    }
    
    function saveSets() {
      const storageKey = `${currentSetType.value.toLowerCase().replace(' ', '')}Sets`
      localStorage.setItem(storageKey, JSON.stringify(sets.value))
    }
    
    function startCreateSet() {
      newSetName.value = ''
      itemInput.value = ''
      editingIndex.value = -1
      showModal.value = true
    }
    
    function editSet(index) {
      editingIndex.value = index
      newSetName.value = sets.value[index].name
      itemInput.value = sets.value[index].items.join('\n')
      showModal.value = true
    }
    
    function viewSet(index) {
      editingIndex.value = index
      editSet(index)
    }
    
    function saveSet() {
      if (!newSetName.value.trim() || parsedItems.value.length === 0) return
      
      const newSet = {
        name: newSetName.value.trim(),
        items: [...parsedItems.value],
        createdAt: new Date().toISOString()
      }
      
      if (editingIndex.value === -1) {
        // Creating new set
        sets.value.push(newSet)
        notificationStore.showNotification(`${currentSetType.value} set created successfully`, 'success')
      } else {
        // Updating existing set
        sets.value[editingIndex.value] = {
          ...newSet,
          updatedAt: new Date().toISOString()
        }
        notificationStore.showNotification(`${currentSetType.value} set updated successfully`, 'success')
      }
      
      saveSets()
      closeModal()
    }
    
    function deleteSet(index) {
      if (confirm(`Are you sure you want to delete this ${currentSetType.value.toLowerCase()} set?`)) {
        const name = sets.value[index].name
        sets.value.splice(index, 1)
        saveSets()
        notificationStore.showNotification(`${currentSetType.value} set deleted`, 'success')
      }
    }
    
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
    
    function closeModal() {
      showModal.value = false
      newSetName.value = ''
      itemInput.value = ''
      editingIndex.value = -1
    }
    
    return {
      currentSetType,
      sets,
      newSetName,
      itemInput,
      showModal,
      editingIndex,
      parsedItems,
      startCreateSet,
      editSet,
      viewSet,
      saveSet,
      deleteSet,
      handleFileImport,
      closeModal
    }
  }
}
</script>

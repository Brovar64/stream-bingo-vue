<template>
  <div class="container py-8">
    <h1 class="title mb-6">Manage Bingo Word Sets</h1>
    <p class="subtitle mb-8">Create and manage reusable word sets for your bingo rooms</p>
    
    <!-- Word Sets List -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card p-4">
        <h2 class="text-xl font-semibold mb-4">Create New Word Set</h2>
        <div class="mb-4">
          <label for="wordSetName" class="block text-sm text-gray-400 mb-1">Word Set Name</label>
          <input 
            type="text" 
            id="wordSetName" 
            v-model="newWordSetName" 
            class="form-control w-full"
            placeholder="e.g., Stream Catchphrases"
          >
        </div>
        
        <button 
          @click="showCreateModal = true" 
          class="btn btn-primary w-full"
          :disabled="!newWordSetName.trim()"
        >
          Create New Word Set
        </button>
      </div>
      
      <div v-if="wordSets.length === 0" class="col-span-2 card p-6 flex flex-col items-center justify-center">
        <div class="text-gray-400 mb-3">No word sets created yet</div>
        <p class="text-sm text-gray-500">Create your first word set to get started!</p>
      </div>
      
      <template v-else>
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
      </template>
    </div>
    
    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Create Word Set: {{ newWordSetName }}</h2>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Enter or Paste Words</label>
          <p class="text-sm text-gray-500 mb-3">
            Each word or phrase should be on a new line. Empty lines will be ignored.
          </p>
          <textarea 
            v-model="wordInput" 
            class="form-control w-full h-48 font-mono"
            placeholder="Enter words here..."
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
            <span class="font-bold">{{ parsedWords.length }}</span> words
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showCreateModal = false" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button 
            @click="saveWordSet" 
            class="btn btn-primary"
            :disabled="parsedWords.length === 0"
          >
            Save Word Set
          </button>
        </div>
      </div>
    </div>
    
    <!-- View/Edit Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Word Set: {{ editingWordSet.name }}</h2>
          <button @click="showViewModal = false" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <div v-if="isEditing" class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Edit Words</label>
          <textarea 
            v-model="wordInput" 
            class="form-control w-full h-48 font-mono"
            placeholder="Enter words here..."
          ></textarea>
        </div>
        
        <div v-else class="mb-6">
          <div class="flex justify-between items-center mb-3">
            <label class="block text-sm text-gray-400">All Words ({{ editingWordSet.words.length }})</label>
            <button 
              @click="isEditing = true" 
              class="text-primary hover:text-primary-light"
            >
              Edit Words
            </button>
          </div>
          
          <div class="bg-background-lighter p-3 rounded h-64 overflow-y-auto">
            <div v-for="(word, index) in editingWordSet.words" :key="index" class="mb-1">
              {{ word }}
            </div>
          </div>
        </div>
        
        <div v-if="isEditing" class="flex justify-between items-center mb-6">
          <div>
            <label for="editFileInput" class="btn bg-background-lighter hover:bg-gray-700 text-white cursor-pointer">
              Import from TXT File
            </label>
            <input 
              type="file" 
              id="editFileInput" 
              accept=".txt" 
              @change="handleFileImport" 
              class="hidden"
            >
          </div>
          
          <div class="text-gray-400">
            <span class="font-bold">{{ parsedWords.length }}</span> words
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showViewModal = false" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
          >
            {{ isEditing ? 'Cancel' : 'Close' }}
          </button>
          
          <button 
            v-if="isEditing"
            @click="updateWordSet" 
            class="btn btn-primary"
            :disabled="parsedWords.length === 0"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
//import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'WordSetsView',
  setup() {
   // const router = useRouter()
    const notificationStore = useNotificationStore()
    
    // State
    const wordSets = ref([])
    const newWordSetName = ref('')
    const wordInput = ref('')
    const showCreateModal = ref(false)
    const showViewModal = ref(false)
    const selectedWordSetIndex = ref(-1)
    const isEditing = ref(false)
    
    // Computed properties
    const parsedWords = computed(() => {
      if (!wordInput.value.trim()) return []
      return wordInput.value
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
    })
    
    const editingWordSet = computed(() => {
      if (selectedWordSetIndex.value === -1) return { name: '', words: [] }
      return wordSets.value[selectedWordSetIndex.value] || { name: '', words: [] }
    })
    
    // Lifecycle hooks
    onMounted(() => {
      loadWordSets()
    })
    
    // Methods
    function loadWordSets() {
      const storedSets = localStorage.getItem('bingoWordSets')
      if (storedSets) {
        try {
          wordSets.value = JSON.parse(storedSets)
        } catch (error) {
          console.error('Failed to parse word sets:', error)
          wordSets.value = []
        }
      }
    }
    
    function saveWordSets() {
      localStorage.setItem('bingoWordSets', JSON.stringify(wordSets.value))
    }
    
    function handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = e => {
        wordInput.value = e.target.result
      }
      reader.onerror = () => {
        notificationStore.showNotification('Failed to read file', 'error')
      }
      reader.readAsText(file)
    }
    
    function saveWordSet() {
      if (!newWordSetName.value.trim() || parsedWords.value.length === 0) return
      
      wordSets.value.push({
        name: newWordSetName.value.trim(),
        words: [...parsedWords.value],
        createdAt: new Date().toISOString()
      })
      
      saveWordSets()
      notificationStore.showNotification(`Word set "${newWordSetName.value}" created successfully`, 'success')
      
      // Reset form
      newWordSetName.value = ''
      wordInput.value = ''
      showCreateModal.value = false
    }
    
    function editWordSet(index) {
      selectedWordSetIndex.value = index
      isEditing.value = true
      wordInput.value = wordSets.value[index].words.join('\n')
      showViewModal.value = true
    }
    
    function viewWordSet(index) {
      selectedWordSetIndex.value = index
      isEditing.value = false
      showViewModal.value = true
    }
    
    function updateWordSet() {
      if (selectedWordSetIndex.value === -1 || parsedWords.value.length === 0) return
      
      wordSets.value[selectedWordSetIndex.value].words = [...parsedWords.value]
      wordSets.value[selectedWordSetIndex.value].updatedAt = new Date().toISOString()
      
      saveWordSets()
      notificationStore.showNotification(`Word set "${editingWordSet.value.name}" updated successfully`, 'success')
      
      // Reset form
      isEditing.value = false
      wordInput.value = ''
    }
    
    function deleteWordSet(index) {
      if (confirm(`Are you sure you want to delete the word set "${wordSets.value[index].name}"?`)) {
        const name = wordSets.value[index].name
        wordSets.value.splice(index, 1)
        saveWordSets()
        notificationStore.showNotification(`Word set "${name}" deleted`, 'success')
      }
    }
    
    return {
      wordSets,
      newWordSetName,
      wordInput,
      showCreateModal,
      showViewModal,
      isEditing,
      parsedWords,
      editingWordSet,
      saveWordSet,
      editWordSet,
      viewWordSet,
      updateWordSet,
      deleteWordSet,
      handleFileImport
    }
  }
}
</script>

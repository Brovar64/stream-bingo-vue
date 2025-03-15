
<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="title">Manage Bingo Word & Punishment Sets</h1>
      <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
        Back to Dashboard
      </router-link>
    </div>
    <p class="subtitle mb-8">Create and manage reusable sets for your bingo rooms</p>
    
    <!-- Management Tabs -->
    <div class="tab-container mb-6">
      <button 
        @click="activeTab = 'create'" 
        :class="['tab-button', activeTab === 'create' ? 'active' : '']"
      >
        Create Sets
      </button>
      <button 
        @click="activeTab = 'manage'" 
        :class="['tab-button', activeTab === 'manage' ? 'active' : '']"
      >
        Manage Existing Sets
      </button>
    </div>
    
    <!-- Create Sets Tab - 3 Column Layout -->
    <div v-if="activeTab === 'create'" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Classic Bingo Words Column -->
      <div class="card p-4">
        <h2 class="text-xl font-semibold mb-4">Classic Bingo Words</h2>
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
          @click="openCreateModal('word')" 
          class="btn btn-primary w-full"
          :disabled="!newWordSetName.trim()"
        >
          Create Word Set
        </button>
      </div>
      
      <!-- Player Punishments Column -->
      <div class="card p-4">
        <h2 class="text-xl font-semibold mb-4">Player Punishments</h2>
        <div class="mb-4">
          <label for="playerPunishmentSetName" class="block text-sm text-gray-400 mb-1">Punishment Set Name</label>
          <input 
            type="text" 
            id="playerPunishmentSetName" 
            v-model="newPlayerPunishmentSetName" 
            class="form-control w-full"
            placeholder="e.g., Player Challenges"
          >
        </div>
        
        <button 
          @click="openCreateModal('playerPunishment')" 
          class="btn btn-primary w-full"
          :disabled="!newPlayerPunishmentSetName.trim()"
        >
          Create Player Punishments
        </button>
      </div>
      
      <!-- Creator Punishments Column -->
      <div class="card p-4">
        <h2 class="text-xl font-semibold mb-4">Creator Punishments</h2>
        <div class="mb-4">
          <label for="creatorPunishmentSetName" class="block text-sm text-gray-400 mb-1">Punishment Set Name</label>
          <input 
            type="text" 
            id="creatorPunishmentSetName" 
            v-model="newCreatorPunishmentSetName" 
            class="form-control w-full"
            placeholder="e.g., Streamer Challenges"
          >
        </div>
        
        <button 
          @click="openCreateModal('creatorPunishment')" 
          class="btn btn-primary w-full"
          :disabled="!newCreatorPunishmentSetName.trim()"
        >
          Create Creator Punishments
        </button>
      </div>
    </div>
    
    <!-- Manage Sets Tab -->
    <div v-if="activeTab === 'manage'" class="mb-8">
      <!-- Management Tabs -->
      <div class="tab-container mb-6">
        <button 
          @click="manageTab = 'words'" 
          :class="['tab-button', manageTab === 'words' ? 'active' : '']"
        >
          Bingo Words
        </button>
        <button 
          @click="manageTab = 'playerPunishments'" 
          :class="['tab-button', manageTab === 'playerPunishments' ? 'active' : '']"
        >
          Player Punishments
        </button>
        <button 
          @click="manageTab = 'creatorPunishments'" 
          :class="['tab-button', manageTab === 'creatorPunishments' ? 'active' : '']"
        >
          Creator Punishments
        </button>
      </div>
      
      <!-- Word Sets List -->
      <div v-if="manageTab === 'words'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div v-if="manageTab === 'playerPunishments'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div v-if="manageTab === 'creatorPunishments'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    
    <!-- Create Word Set Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">
            {{ creatingType === 'word' ? 'Create Word Set: ' : 
               creatingType === 'playerPunishment' ? 'Create Player Punishment Set: ' : 
               'Create Creator Punishment Set: ' }}
            {{ creatingName }}
          </h2>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <div v-if="creatingType === 'word'" class="mb-6">
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
        
        <div v-else class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Enter Phrase and Punishment Pairs</label>
          <p class="text-sm text-gray-500 mb-3">
            Format: "Phrase|Punishment" (one pair per line)
          </p>
          <textarea 
            v-model="punishmentInput" 
            class="form-control w-full h-48 font-mono"
            placeholder="When X happens|Do Y punishment&#10;Another trigger|Another punishment&#10;..."
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
            <span class="font-bold">
              {{ creatingType === 'word' ? parsedWords.length : parsedPunishments.length }}
            </span> 
            {{ creatingType === 'word' ? 'words' : 'entries' }}
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeCreateModal" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button 
            @click="saveSet" 
            class="btn btn-primary"
            :disabled="creatingType === 'word' ? parsedWords.length === 0 : parsedPunishments.length === 0"
          >
            Save Set
          </button>
        </div>
      </div>
    </div>
    
    <!-- View/Edit Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-background-card rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">
            {{ viewingType === 'word' ? 'Word Set: ' : 
               viewingType === 'playerPunishment' ? 'Player Punishment Set: ' : 
               'Creator Punishment Set: ' }}
            {{ viewingName }}
          </h2>
          <button @click="closeViewModal" class="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <!-- Word Set Editing -->
        <div v-if="viewingType === 'word'">
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
              <label class="block text-sm text-gray-400">All Words ({{ editingWordSet.words?.length || 0 }})</label>
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
        </div>
        
        <!-- Punishment Set Editing -->
        <div v-else>
          <div v-if="isEditing" class="mb-6">
            <label class="block text-sm text-gray-400 mb-2">Edit Phrase/Punishment Pairs</label>
            <textarea 
              v-model="punishmentInput" 
              class="form-control w-full h-48 font-mono"
              placeholder="Phrase|Punishment&#10;Another phrase|Another punishment"
            ></textarea>
          </div>
          
          <div v-else class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <label class="block text-sm text-gray-400">
                All Entries ({{ editingPunishmentSet.entries?.length || 0 }})
              </label>
              <button 
                @click="isEditing = true" 
                class="text-primary hover:text-primary-light"
              >
                Edit Entries
              </button>
            </div>
            
            <div class="bg-background-lighter p-3 rounded h-64 overflow-y-auto">
              <div v-for="(entry, index) in editingPunishmentSet.entries" :key="index" class="mb-3 p-2 bg-background rounded">
                <div class="font-medium">{{ entry.phrase }}</div>
                <div class="text-sm italic text-gray-400">{{ entry.punishment }}</div>
              </div>
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
            <span class="font-bold">
              {{ viewingType === 'word' ? parsedWords.length : parsedPunishments.length }}
            </span> 
            {{ viewingType === 'word' ? 'words' : 'entries' }}
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeViewModal" 
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
          >
            {{ isEditing ? 'Cancel' : 'Close' }}
          </button>
          
          <button 
            v-if="isEditing"
            @click="updateSet" 
            class="btn btn-primary"
            :disabled="viewingType === 'word' ? parsedWords.length === 0 : parsedPunishments.length === 0"
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
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'WordSetsView',
  setup() {
    const router = useRouter()
    const notificationStore = useNotificationStore()
    
    // Tab Navigation State
    const activeTab = ref('create')
    const manageTab = ref('words')
    
    // Word Sets State
    const wordSets = ref([])
    const newWordSetName = ref('')
    
    // Player Punishment Sets State
    const playerPunishmentSets = ref([])
    const newPlayerPunishmentSetName = ref('')
    
    // Creator Punishment Sets State
    const creatorPunishmentSets = ref([])
    const newCreatorPunishmentSetName = ref('')
    
    // Modal State
    const showCreateModal = ref(false)
    const showViewModal = ref(false)
    const isEditing = ref(false)
    
    // Input State
    const wordInput = ref('')
    const punishmentInput = ref('')
    
    // Currently selected items
    const selectedWordSetIndex = ref(-1)
    const selectedPlayerPunishmentSetIndex = ref(-1)
    const selectedCreatorPunishmentSetIndex = ref(-1)
    
    // Currently creating/viewing type
    const creatingType = ref('word') // 'word', 'playerPunishment', 'creatorPunishment'
    const viewingType = ref('word')
    
    // Computed properties for inputs
    const parsedWords = computed(() => {
      if (!wordInput.value.trim()) return []
      return wordInput.value
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
    })
    
    const parsedPunishments = computed(() => {
      if (!punishmentInput.value.trim()) return []
      return punishmentInput.value
        .split('\n')
        .map(line => {
          const parts = line.split('|')
          if (parts.length === 2) {
            return {
              phrase: parts[0].trim(),
              punishment: parts[1].trim()
            }
          }
          return null
        })
        .filter(entry => entry && entry.phrase && entry.punishment)
    })
    
    // Computed properties for currently editing items
    const editingWordSet = computed(() => {
      if (selectedWordSetIndex.value === -1) return { name: '', words: [] }
      return wordSets.value[selectedWordSetIndex.value] || { name: '', words: [] }
    })
    
    const editingPunishmentSet = computed(() => {
      if (viewingType.value === 'playerPunishment') {
        if (selectedPlayerPunishmentSetIndex.value === -1) return { name: '', entries: [] }
        return playerPunishmentSets.value[selectedPlayerPunishmentSetIndex.value] || { name: '', entries: [] }
      } else {
        if (selectedCreatorPunishmentSetIndex.value === -1) return { name: '', entries: [] }
        return creatorPunishmentSets.value[selectedCreatorPunishmentSetIndex.value] || { name: '', entries: [] }
      }
    })
    
    // Computed name based on what's being viewed or created
    const creatingName = computed(() => {
      if (creatingType.value === 'word') return newWordSetName.value
      if (creatingType.value === 'playerPunishment') return newPlayerPunishmentSetName.value
      return newCreatorPunishmentSetName.value
    })
    
    const viewingName = computed(() => {
      if (viewingType.value === 'word') return editingWordSet.value.name
      return editingPunishmentSet.value.name
    })
    
    // Lifecycle hooks
    onMounted(() => {
      loadSets()
    })
    
    // Methods for data loading/saving
    function loadSets() {
      loadWordSets()
      loadPunishmentSets()
    }
    
    function loadWordSets() {
      const storedSets = localStorage.getItem('bingoWordSets')
      if (storedSets) {
        try {
          wordSets.value = JSON.parse(storedSets)
        } catch (error) {
          console.error('Failed to parse word sets:', error)
          wordSets.value = []
        }
      } else {
        // Initialize with empty array if nothing found in localStorage
        wordSets.value = []
      }
    }
    
    function loadPunishmentSets() {
      // Load player punishment sets
      const storedPlayerSets = localStorage.getItem('bingoPlayerPunishmentSets')
      if (storedPlayerSets) {
        try {
          playerPunishmentSets.value = JSON.parse(storedPlayerSets)
        } catch (error) {
          console.error('Failed to parse player punishment sets:', error)
          playerPunishmentSets.value = []
        }
      } else {
        // Initialize with empty array
        playerPunishmentSets.value = []
      }
      
      // Load creator punishment sets
      const storedCreatorSets = localStorage.getItem('bingoCreatorPunishmentSets')
      if (storedCreatorSets) {
        try {
          creatorPunishmentSets.value = JSON.parse(storedCreatorSets)
        } catch (error) {
          console.error('Failed to parse creator punishment sets:', error)
          creatorPunishmentSets.value = []
        }
      } else {
        // Initialize with empty array
        creatorPunishmentSets.value = []
      }
    }
    
    function saveWordSets() {
      localStorage.setItem('bingoWordSets', JSON.stringify(wordSets.value))
      // Ensure updates are reflected in the dashboard
      localStorage.setItem('bingoWordSetsUpdated', new Date().toISOString())
    }
    
    function savePlayerPunishmentSets() {
      localStorage.setItem('bingoPlayerPunishmentSets', JSON.stringify(playerPunishmentSets.value))
      localStorage.setItem('punishmentSetsUpdated', new Date().toISOString())
    }
    
    function saveCreatorPunishmentSets() {
      localStorage.setItem('bingoCreatorPunishmentSets', JSON.stringify(creatorPunishmentSets.value))
      localStorage.setItem('punishmentSetsUpdated', new Date().toISOString())
    }
    
    // File import handling
    function handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = e => {
        if ((showCreateModal.value && creatingType.value === 'word') || 
            (showViewModal.value && viewingType.value === 'word')) {
          wordInput.value = e.target.result
        } else {
          punishmentInput.value = e.target.result
        }
      }
      reader.onerror = () => {
        notificationStore.showNotification('Failed to read file', 'error')
      }
      reader.readAsText(file)
      
      // Reset file input to allow selecting the same file again
      event.target.value = ''
    }
    
    // Create operations
    function openCreateModal(type) {
      creatingType.value = type
      wordInput.value = ''
      punishmentInput.value = ''
      showCreateModal.value = true
    }
    
    // Modal closing
    function closeCreateModal() {
      showCreateModal.value = false
      wordInput.value = ''
      punishmentInput.value = ''
    }
    
    function closeViewModal() {
      showViewModal.value = false
      isEditing.value = false
      wordInput.value = ''
      punishmentInput.value = ''
    }
    
    // Save new set
    function saveSet() {
      if (creatingType.value === 'word') {
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
      } 
      else if (creatingType.value === 'playerPunishment') {
        if (!newPlayerPunishmentSetName.value.trim() || parsedPunishments.value.length === 0) return
        
        playerPunishmentSets.value.push({
          name: newPlayerPunishmentSetName.value.trim(),
          entries: [...parsedPunishments.value],
          createdAt: new Date().toISOString()
        })
        
        savePlayerPunishmentSets()
        notificationStore.showNotification(`Player punishment set "${newPlayerPunishmentSetName.value}" created successfully`, 'success')
        
        // Reset form
        newPlayerPunishmentSetName.value = ''
      }
      else {
        if (!newCreatorPunishmentSetName.value.trim() || parsedPunishments.value.length === 0) return
        
        creatorPunishmentSets.value.push({
          name: newCreatorPunishmentSetName.value.trim(),
          entries: [...parsedPunishments.value],
          createdAt: new Date().toISOString()
        })
        
        saveCreatorPunishmentSets()
        notificationStore.showNotification(`Creator punishment set "${newCreatorPunishmentSetName.value}" created successfully`, 'success')
        
        // Reset form
        newCreatorPunishmentSetName.value = ''
      }
      
      // Close the modal
      wordInput.value = ''
      punishmentInput.value = ''
      showCreateModal.value = false
      
      // Switch to manage tab to show the newly created set
      activeTab.value = 'manage'
      if (creatingType.value === 'word') {
        manageTab.value = 'words'
      } else if (creatingType.value === 'playerPunishment') {
        manageTab.value = 'playerPunishments'
      } else {
        manageTab.value = 'creatorPunishments'
      }
    }
    
    // View operations
    function viewWordSet(index) {
      selectedWordSetIndex.value = index
      viewingType.value = 'word'
      isEditing.value = false
      showViewModal.value = true
    }
    
    function viewPunishmentSet(type, index) {
      if (type === 'player') {
        selectedPlayerPunishmentSetIndex.value = index
        selectedCreatorPunishmentSetIndex.value = -1
        viewingType.value = 'playerPunishment'
      } else {
        selectedCreatorPunishmentSetIndex.value = index
        selectedPlayerPunishmentSetIndex.value = -1
        viewingType.value = 'creatorPunishment'
      }
      
      isEditing.value = false
      showViewModal.value = true
    }
    
    // Edit operations
    function editWordSet(index) {
      selectedWordSetIndex.value = index
      viewingType.value = 'word'
      isEditing.value = true
      wordInput.value = wordSets.value[index].words.join('\n')
      showViewModal.value = true
    }
    
    function editPunishmentSet(type, index) {
      if (type === 'player') {
        selectedPlayerPunishmentSetIndex.value = index
        selectedCreatorPunishmentSetIndex.value = -1
        viewingType.value = 'playerPunishment'
        punishmentInput.value = playerPunishmentSets.value[index].entries
          .map(entry => `${entry.phrase}|${entry.punishment}`)
          .join('\n')
      } else {
        selectedCreatorPunishmentSetIndex.value = index
        selectedPlayerPunishmentSetIndex.value = -1
        viewingType.value = 'creatorPunishment'
        punishmentInput.value = creatorPunishmentSets.value[index].entries
          .map(entry => `${entry.phrase}|${entry.punishment}`)
          .join('\n')
      }
      
      isEditing.value = true
      showViewModal.value = true
    }
    
    // Update operations
    function updateSet() {
      if (viewingType.value === 'word') {
        if (selectedWordSetIndex.value === -1 || parsedWords.value.length === 0) return
        
        wordSets.value[selectedWordSetIndex.value].words = [...parsedWords.value]
        wordSets.value[selectedWordSetIndex.value].updatedAt = new Date().toISOString()
        
        saveWordSets()
        notificationStore.showNotification(`Word set "${editingWordSet.value.name}" updated successfully`, 'success')
      } 
      else if (viewingType.value === 'playerPunishment') {
        if (selectedPlayerPunishmentSetIndex.value === -1 || parsedPunishments.value.length === 0) return
        
        playerPunishmentSets.value[selectedPlayerPunishmentSetIndex.value].entries = [...parsedPunishments.value]
        playerPunishmentSets.value[selectedPlayerPunishmentSetIndex.value].updatedAt = new Date().toISOString()
        
        savePlayerPunishmentSets()
        notificationStore.showNotification(`Player punishment set "${editingPunishmentSet.value.name}" updated successfully`, 'success')
      }
      else {
        if (selectedCreatorPunishmentSetIndex.value === -1 || parsedPunishments.value.length === 0) return
        
        creatorPunishmentSets.value[selectedCreatorPunishmentSetIndex.value].entries = [...parsedPunishments.value]
        creatorPunishmentSets.value[selectedCreatorPunishmentSetIndex.value].updatedAt = new Date().toISOString()
        
        saveCreatorPunishmentSets()
        notificationStore.showNotification(`Creator punishment set "${editingPunishmentSet.value.name}" updated successfully`, 'success')
      }
      
      // Reset form
      isEditing.value = false
      wordInput.value = ''
      punishmentInput.value = ''
    }
    
    // Delete operations
    function deleteWordSet(index) {
      if (confirm(`Are you sure you want to delete the word set "${wordSets.value[index].name}"?`)) {
        const name = wordSets.value[index].name
        wordSets.value.splice(index, 1)
        saveWordSets()
        notificationStore.showNotification(`Word set "${name}" deleted`, 'success')
      }
    }
    
    function deletePunishmentSet(type, index) {
      if (type === 'player') {
        if (confirm(`Are you sure you want to delete the player punishment set "${playerPunishmentSets.value[index].name}"?`)) {
          const name = playerPunishmentSets.value[index].name
          playerPunishmentSets.value.splice(index, 1)
          savePlayerPunishmentSets()
          notificationStore.showNotification(`Player punishment set "${name}" deleted`, 'success')
        }
      } else {
        if (confirm(`Are you sure you want to delete the creator punishment set "${creatorPunishmentSets.value[index].name}"?`)) {
          const name = creatorPunishmentSets.value[index].name
          creatorPunishmentSets.value.splice(index, 1)
          saveCreatorPunishmentSets()
          notificationStore.showNotification(`Creator punishment set "${name}" deleted`, 'success')
        }
      }
    }
    
    return {
      // Tab navigation
      activeTab,
      manageTab,
      
      // Word Sets
      wordSets,
      newWordSetName,
      
      // Punishment Sets
      playerPunishmentSets,
      creatorPunishmentSets,
      newPlayerPunishmentSetName,
      newCreatorPunishmentSetName,
      
      // Modal state
      showCreateModal,
      showViewModal,
      isEditing,
      
      // Input state
      wordInput,
      punishmentInput,
      
      // Computed
      parsedWords,
      parsedPunishments,
      editingWordSet,
      editingPunishmentSet,
      creatingType,
      viewingType,
      creatingName,
      viewingName,
      
      // Methods
      openCreateModal,
      handleFileImport,
      saveSet,
      viewWordSet,
      viewPunishmentSet,
      editWordSet,
      editPunishmentSet,
      updateSet,
      deleteWordSet,
      deletePunishmentSet,
      closeCreateModal,
      closeViewModal
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

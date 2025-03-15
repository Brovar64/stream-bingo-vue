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
      <CreateWordSetPanel 
        v-model:value="newWordSetName"
        @create="openCreateModal"
      />
      
      <!-- Player Punishments Column -->
      <CreatePlayerPunishmentPanel
        v-model:value="newPlayerPunishmentSetName"
        @create="openCreateModal"
      />
      
      <!-- Creator Punishments Column -->
      <CreateCreatorPunishmentPanel
        v-model:value="newCreatorPunishmentSetName"
        @create="openCreateModal"
      />
    </div>
    
    <!-- Manage Sets Tab -->
    <div v-if="activeTab === 'manage'" class="mb-8">
      <SetsManager
        :word-sets="wordSets"
        :player-punishment-sets="playerPunishmentSets"
        :creator-punishment-sets="creatorPunishmentSets"
        :initial-tab="manageTab"
        @update:active-tab="manageTab = $event"
        @view-word-set="viewWordSet"
        @edit-word-set="editWordSet"
        @delete-word-set="deleteWordSet"
        @view-punishment-set="viewPunishmentSet"
        @edit-punishment-set="editPunishmentSet"
        @delete-punishment-set="deletePunishmentSet"
      />
    </div>
    
    <!-- Create Set Modal -->
    <CreateSetModal
      v-model:visible="showCreateModal"
      :type="creatingType"
      :set-name="creatingName"
      @save="handleSaveSet"
      @cancel="closeCreateModal"
      @file-error="handleFileError"
    />
    
    <!-- View/Edit Modal -->
    <ViewEditModal
      v-model:visible="showViewModal"
      :type="viewingType"
      :set-name="viewingName"
      :set-words="viewingType === 'word' ? editingWordSet.words : []"
      :set-punishments="viewingType !== 'word' ? editingPunishmentSet.entries : []"
      @save="handleUpdateSet"
      @cancel="closeViewModal"
      @file-error="handleFileError"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

// Import components
import CreateWordSetPanel from '@/components/word-sets/CreateWordSetPanel.vue'
import CreatePlayerPunishmentPanel from '@/components/word-sets/CreatePlayerPunishmentPanel.vue'
import CreateCreatorPunishmentPanel from '@/components/word-sets/CreateCreatorPunishmentPanel.vue'
import SetsManager from '@/components/word-sets/SetsManager.vue'
import CreateSetModal from '@/components/word-sets/CreateSetModal.vue'
import ViewEditModal from '@/components/word-sets/ViewEditModal.vue'

export default {
  name: 'WordSetsView',
  
  components: {
    CreateWordSetPanel,
    CreatePlayerPunishmentPanel,
    CreateCreatorPunishmentPanel,
    SetsManager,
    CreateSetModal,
    ViewEditModal
  },
  
  setup() {
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
    
    // Currently selected items
    const selectedWordSetIndex = ref(-1)
    const selectedPlayerPunishmentSetIndex = ref(-1)
    const selectedCreatorPunishmentSetIndex = ref(-1)
    
    // Currently creating/viewing type
    const creatingType = ref('word') // 'word', 'playerPunishment', 'creatorPunishment'
    const viewingType = ref('word')
    
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
    
    // Handle file error
    function handleFileError(message) {
      notificationStore.showNotification(message, 'error')
    }
    
    // Create operations
    function openCreateModal(type) {
      creatingType.value = type
      showCreateModal.value = true
    }
    
    // Modal closing
    function closeCreateModal() {
      showCreateModal.value = false
    }
    
    function closeViewModal() {
      showViewModal.value = false
    }
    
    // Save new set
    function handleSaveSet(data) {
      if (data.type === 'word') {
        wordSets.value.push({
          name: data.name.trim(),
          words: [...data.content],
          createdAt: new Date().toISOString()
        })
        
        saveWordSets()
        notificationStore.showNotification(`Word set "${data.name}" created successfully`, 'success')
        
        // Reset form
        newWordSetName.value = ''
      } 
      else if (data.type === 'playerPunishment') {
        playerPunishmentSets.value.push({
          name: data.name.trim(),
          entries: [...data.content],
          createdAt: new Date().toISOString()
        })
        
        savePlayerPunishmentSets()
        notificationStore.showNotification(`Player punishment set "${data.name}" created successfully`, 'success')
        
        // Reset form
        newPlayerPunishmentSetName.value = ''
      }
      else {
        creatorPunishmentSets.value.push({
          name: data.name.trim(),
          entries: [...data.content],
          createdAt: new Date().toISOString()
        })
        
        saveCreatorPunishmentSets()
        notificationStore.showNotification(`Creator punishment set "${data.name}" created successfully`, 'success')
        
        // Reset form
        newCreatorPunishmentSetName.value = ''
      }
      
      // Switch to manage tab to show the newly created set
      activeTab.value = 'manage'
      if (data.type === 'word') {
        manageTab.value = 'words'
      } else if (data.type === 'playerPunishment') {
        manageTab.value = 'playerPunishments'
      } else {
        manageTab.value = 'creatorPunishments'
      }
    }
    
    // View operations
    function viewWordSet(index) {
      selectedWordSetIndex.value = index
      viewingType.value = 'word'
      showViewModal.value = true
    }
    
    function viewPunishmentSet(data) {
      if (data.type === 'player') {
        selectedPlayerPunishmentSetIndex.value = data.index
        selectedCreatorPunishmentSetIndex.value = -1
        viewingType.value = 'playerPunishment'
      } else {
        selectedCreatorPunishmentSetIndex.value = data.index
        selectedPlayerPunishmentSetIndex.value = -1
        viewingType.value = 'creatorPunishment'
      }
      
      showViewModal.value = true
    }
    
    // Edit operations
    function editWordSet(index) {
      selectedWordSetIndex.value = index
      viewingType.value = 'word'
      showViewModal.value = true
    }
    
    function editPunishmentSet(data) {
      if (data.type === 'player') {
        selectedPlayerPunishmentSetIndex.value = data.index
        selectedCreatorPunishmentSetIndex.value = -1
        viewingType.value = 'playerPunishment'
      } else {
        selectedCreatorPunishmentSetIndex.value = data.index
        selectedPlayerPunishmentSetIndex.value = -1
        viewingType.value = 'creatorPunishment'
      }
      
      showViewModal.value = true
    }
    
    // Update operations
    function handleUpdateSet(data) {
      if (data.type === 'word') {
        if (selectedWordSetIndex.value === -1) return
        
        wordSets.value[selectedWordSetIndex.value].words = [...data.content]
        wordSets.value[selectedWordSetIndex.value].updatedAt = new Date().toISOString()
        
        saveWordSets()
        notificationStore.showNotification(`Word set "${editingWordSet.value.name}" updated successfully`, 'success')
      } 
      else if (data.type === 'playerPunishment') {
        if (selectedPlayerPunishmentSetIndex.value === -1) return
        
        playerPunishmentSets.value[selectedPlayerPunishmentSetIndex.value].entries = [...data.content]
        playerPunishmentSets.value[selectedPlayerPunishmentSetIndex.value].updatedAt = new Date().toISOString()
        
        savePlayerPunishmentSets()
        notificationStore.showNotification(`Player punishment set "${editingPunishmentSet.value.name}" updated successfully`, 'success')
      }
      else {
        if (selectedCreatorPunishmentSetIndex.value === -1) return
        
        creatorPunishmentSets.value[selectedCreatorPunishmentSetIndex.value].entries = [...data.content]
        creatorPunishmentSets.value[selectedCreatorPunishmentSetIndex.value].updatedAt = new Date().toISOString()
        
        saveCreatorPunishmentSets()
        notificationStore.showNotification(`Creator punishment set "${editingPunishmentSet.value.name}" updated successfully`, 'success')
      }
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
    
    function deletePunishmentSet(data) {
      if (data.type === 'player') {
        if (confirm(`Are you sure you want to delete the player punishment set "${playerPunishmentSets.value[data.index].name}"?`)) {
          const name = playerPunishmentSets.value[data.index].name
          playerPunishmentSets.value.splice(data.index, 1)
          savePlayerPunishmentSets()
          notificationStore.showNotification(`Player punishment set "${name}" deleted`, 'success')
        }
      } else {
        if (confirm(`Are you sure you want to delete the creator punishment set "${creatorPunishmentSets.value[data.index].name}"?`)) {
          const name = creatorPunishmentSets.value[data.index].name
          creatorPunishmentSets.value.splice(data.index, 1)
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
      
      // Computed
      editingWordSet,
      editingPunishmentSet,
      creatingType,
      viewingType,
      creatingName,
      viewingName,
      
      // Methods
      openCreateModal,
      handleSaveSet,
      handleFileError,
      viewWordSet,
      viewPunishmentSet,
      editWordSet,
      editPunishmentSet,
      handleUpdateSet,
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

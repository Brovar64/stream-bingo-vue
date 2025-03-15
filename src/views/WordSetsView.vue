<script>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'WordSetsView',
  props: {
    type: {
      type: String,
      default: 'Word',
      validator: (value) => ['Word', 'Player Punishment', 'Creator Punishment'].includes(value)
    }
  },
  setup(props) {
    const notificationStore = useNotificationStore()
    
    // State
    const sets = ref([])
    const newSetName = ref('')
    const itemInput = ref('')
    const showCreateModal = ref(false)
    const showViewModal = ref(false)
    const selectedSetIndex = ref(-1)
    const isEditing = ref(false)
    
    // Computed properties
    const parsedItems = computed(() => {
      if (!itemInput.value.trim()) return []
      return itemInput.value
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0)
    })
    
    const editingSet = computed(() => {
      if (selectedSetIndex.value === -1) return { name: '', items: [] }
      return sets.value[selectedSetIndex.value] || { name: '', items: [] }
    })
    
    // Lifecycle hooks
    onMounted(() => {
      loadSets()
    })
    
    // Methods
    function loadSets() {
      const storageKey = `${props.type.toLowerCase().replace(' ', '')}Sets`
      const storedSets = localStorage.getItem(storageKey)
      if (storedSets) {
        try {
          sets.value = JSON.parse(storedSets)
        } catch (error) {
          console.error('Failed to parse sets:', error)
          sets.value = []
        }
      }
    }
    
    function saveSets() {
      const storageKey = `${props.type.toLowerCase().replace(' ', '')}Sets`
      localStorage.setItem(storageKey, JSON.stringify(sets.value))
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
    
    function saveSet() {
      if (!newSetName.value.trim() || parsedItems.value.length === 0) return
      
      sets.value.push({
        name: newSetName.value.trim(),
        items: [...parsedItems.value],
        createdAt: new Date().toISOString()
      })
      
      saveSets()
      notificationStore.showNotification(`${props.type} set "${newSetName.value}" created successfully`, 'success')
      
      // Reset form
      newSetName.value = ''
      itemInput.value = ''
      showCreateModal.value = false
    }
    
    function editSet(index) {
      selectedSetIndex.value = index
      isEditing.value = true
      itemInput.value = sets.value[index].items.join('\n')
      showViewModal.value = true
    }
    
    function viewSet(index) {
      selectedSetIndex.value = index
      isEditing.value = false
      showViewModal.value = true
    }
    
    function updateSet() {
      if (selectedSetIndex.value === -1 || parsedItems.value.length === 0) return
      
      sets.value[selectedSetIndex.value].items = [...parsedItems.value]
      sets.value[selectedSetIndex.value].updatedAt = new Date().toISOString()
      
      saveSets()
      notificationStore.showNotification(`${props.type} set "${editingSet.value.name}" updated successfully`, 'success')
      
      // Reset form
      isEditing.value = false
      itemInput.value = ''
    }
    
    function deleteSet(index) {
      if (confirm(`Are you sure you want to delete the ${props.type.toLowerCase()} set "${sets.value[index].name}"?`)) {
        const name = sets.value[index].name
        sets.value.splice(index, 1)
        saveSets()
        notificationStore.showNotification(`${props.type} set "${name}" deleted`, 'success')
      }
    }
    
    return {
      sets,
      newSetName,
      itemInput,
      showCreateModal,
      showViewModal,
      isEditing,
      parsedItems,
      editingSet,
      saveSet,
      editSet,
      viewSet,
      updateSet,
      deleteSet,
      handleFileImport
    }
  }
}
</script>

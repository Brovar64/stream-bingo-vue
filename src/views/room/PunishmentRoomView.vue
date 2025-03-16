<template>
  <div class="container py-8">
    <!-- Loading state -->
    <div v-if="loading || !roomData" class="text-center py-16">
      <div class="spinner mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold">Loading Room</h2>
      <p class="text-gray-400">Please wait...</p>
    </div>

    <!-- Room management interface -->
    <div v-else>
      <!-- Header section -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="title">Punishment Room: {{ roomData.id }}</h1>
            <span
                :class="['status-badge', roomData.status === 'active' ? 'bg-success' : 'bg-warning']"
            >
             {{ roomData.status === 'active' ? 'Active' : 'Setup' }}
           </span>
          </div>
          <p class="subtitle">{{ roomData.gridHeight }} rows × 4 columns grid</p>
        </div>

        <div class="flex flex-wrap gap-3 mt-4 md:mt-0 items-center">
          <!-- Room Code Display when room is active -->
          <div v-if="isRoomActive" class="flex items-center bg-background-lighter px-3 py-2 rounded mr-3">
            <div class="mr-3">
              <div class="text-xs text-gray-400">Room Code:</div>
              <div class="font-bold text-primary">{{ roomData.id }}</div>
            </div>
            <button
                @click="copyRoomCode"
                class="btn bg-primary hover:bg-primary-dark text-white text-sm py-1 px-2"
                title="Copy room code to clipboard"
            >
              Copy
            </button>
          </div>

          <router-link to="/dashboard" class="btn bg-background-lighter hover:bg-gray-700 text-white">
            Back to Dashboard
          </router-link>

          <button
              v-if="isRoomActive"
              @click="resetGame"
              class="btn bg-warning hover:bg-yellow-700 text-white"
          >
            Reset Game
          </button>
        </div>
      </div>

      <!-- Game statistics -->
      <div v-if="isRoomActive" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Players</h3>
          <div class="text-2xl font-bold">{{ roomData.players?.length || 0 }}</div>
        </div>
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Called Cells</h3>
          <div class="text-2xl font-bold">{{ roomData.calledOutCells?.length || 0 }}</div>
        </div>
        <div class="card p-4">
          <h3 class="text-gray-400 text-sm mb-1">Completed Punishments</h3>
          <div class="text-2xl font-bold">{{ roomData.completedPunishments?.length || 0 }}</div>
        </div>
      </div>

      <!-- Setup Mode Content - using a two-column layout -->
      <div v-if="isRoomSetup" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Left Column (3/4): Grid Setup -->
        <div class="lg:col-span-3">
          <PunishmentGridEditor
              :grid-height="roomData.gridHeight"
              :grid="roomData.grid || {}"
              @edit-cell="editCell"
              @remove-cell="removeCell"
          />
        </div>

        <!-- Right Column (1/4): Setup Controls -->
        <div class="lg:col-span-1">
          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Setup Punishment Bingo</h2>

            <div class="mb-4">
              <div class="progress-bar">
                <div
                    class="progress"
                    :style="`width: ${(Object.keys(roomData.grid || {}).length / requiredCells) * 100}%`"
                ></div>
              </div>
              <div class="text-sm text-gray-400 mt-1">
                {{ Object.keys(roomData.grid || {}).length }} / {{ requiredCells }} cells filled
              </div>
            </div>

            <!-- Add Bingo Words Set -->
            <div class="mb-4">
              <label class="text-sm font-medium mb-2 block">Bingo Words Set</label>
              <select v-model="selectedWordSet" class="form-control mb-2">
                <option value="">Select a word set...</option>
                <option v-for="set in wordSetStore.wordSets" :key="set.id" :value="set.id">
                  {{ set.name }} ({{ set.items.length }})
                </option>
              </select>
              <div class="grid grid-cols-2 gap-2 mb-4">
                <button
                    @click="applyWordSetToSide('left')"
                    class="btn bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                    :disabled="!selectedWordSet"
                >
                  Apply to Creator Side
                </button>
                <button
                    @click="applyWordSetToSide('right')"
                    class="btn bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                    :disabled="!selectedWordSet"
                >
                  Apply to Player Side
                </button>
              </div>
            </div>

            <!-- Add from Creator Punishment Set -->
            <div class="mb-4">
              <label class="text-sm font-medium mb-2 block">Creator Punishment Sets</label>
              <select v-model="selectedCreatorSet" class="form-control mb-2">
                <option value="">Select a set...</option>
                <option v-for="set in wordSetStore.creatorPunishmentSets" :key="set.id" :value="set.id">
                  {{ set.name }} ({{ set.items.length }})
                </option>
              </select>
              <button
                  @click="applyCreatorSet"
                  class="btn bg-blue-600 hover:bg-blue-700 text-white w-full mb-4"
                  :disabled="!selectedCreatorSet"
              >
                Apply to Creator Side
              </button>
            </div>

            <!-- Add from Player Punishment Set -->
            <div class="mb-4">
              <label class="text-sm font-medium mb-2 block">Player Punishment Sets</label>
              <select v-model="selectedPlayerSet" class="form-control mb-2">
                <option value="">Select a set...</option>
                <option v-for="set in wordSetStore.playerPunishmentSets" :key="set.id" :value="set.id">
                  {{ set.name }} ({{ set.items.length }})
                </option>
              </select>
              <button
                  @click="applyPlayerSet"
                  class="btn bg-green-600 hover:bg-green-700 text-white w-full mb-4"
                  :disabled="!selectedPlayerSet"
              >
                Apply to Player Side
              </button>
            </div>

            <!-- Manual Cell Entry -->
            <div class="mb-6">
              <h3 class="text-md font-semibold mb-2">Add Individual Cell</h3>
              <form @submit.prevent="addManualCell" class="space-y-3">
                <div class="form-group">
                  <label for="cellPhrase" class="text-sm">Phrase</label>
                  <input
                      type="text"
                      id="cellPhrase"
                      v-model="newCell.phrase"
                      class="form-control"
                      placeholder="Enter bingo phrase"
                      required
                  />
                </div>

                <div class="form-group">
                  <label for="cellPunishment" class="text-sm">Punishment</label>
                  <input
                      type="text"
                      id="cellPunishment"
                      v-model="newCell.punishment"
                      class="form-control"
                      placeholder="Enter punishment"
                      required
                  />
                </div>

                <div class="form-group">
                  <label for="cellSide" class="text-sm">Side</label>
                  <select id="cellSide" v-model="newCell.side" class="form-control">
                    <option value="left">Creator Side</option>
                    <option value="right">Players Side</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="cellPosition" class="text-sm">Position</label>
                  <div class="grid grid-cols-2 gap-2">
                    <select id="cellRow" v-model="newCell.row" class="form-control">
                      <option v-for="row in roomData.gridHeight" :key="row" :value="row-1">
                        Row {{ row }}
                      </option>
                    </select>
                    <select id="cellCol" v-model="newCell.col" class="form-control">
                      <option v-for="col in 4" :key="col" :value="col-1"
                              :disabled="(col <= 2 && newCell.side === 'right') || (col > 2 && newCell.side === 'left')">
                        {{ col <= 2 ? 'Left' : 'Right' }} Col {{ col <= 2 ? col : col-2 }}
                      </option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-full">
                  Add Cell
                </button>
              </form>
            </div>

            <!-- Start Game Button -->
            <button
                @click="startGame"
                :disabled="Object.keys(roomData.grid || {}).length < requiredCells"
                :class="['btn w-full', Object.keys(roomData.grid || {}).length < requiredCells ? 'bg-gray-600 cursor-not-allowed' : 'btn-primary']"
            >
              {{ Object.keys(roomData.grid || {}).length < requiredCells ? `Need ${requiredCells - Object.keys(roomData.grid || {}).length} more cells` : 'Start Game' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Active Game Content -->
      <div v-if="isRoomActive" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Players -->
        <div class="lg:col-span-3">
          <PunishmentPlayerList :players="roomData.players || []" />
        </div>

        <!-- Right Column: Bingo Grid -->
        <div class="lg:col-span-9">
          <ActivePunishmentGrid
              :grid-height="roomData.gridHeight"
              :grid="roomData.grid || {}"
              :called-out-cells="roomData.calledOutCells || []"
              :completed-punishments="roomData.completedPunishments || []"
              @call-out="handleCellClick"
              @resolve-punishment="resolvePunishment"
          />
        </div>
      </div>
    </div>

    <!-- Cell Edit Modal -->
    <PunishmentCellEditor
        v-model:visible="showEditModal"
        :cell="editingCell"
        :position="editingCellPosition"
        :side="editingCellSide"
        @save="saveCell"
        @cancel="cancelEdit"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePunishmentRoomStore } from '@/stores/punishment-room'
import { useNotificationStore } from '@/stores/notification'
import { useWordSetStore } from '@/stores/word-sets'
import PunishmentGridEditor from '@/components/punishment/PunishmentGridEditor.vue'
import ActivePunishmentGrid from '@/components/punishment/ActivePunishmentGrid.vue'
import PunishmentCellEditor from '@/components/punishment/PunishmentCellEditor.vue'
import PunishmentPlayerList from '@/components/punishment/PunishmentPlayerList.vue'

export default {
  name: 'PunishmentRoomView',
  components: {
    PunishmentGridEditor,
    ActivePunishmentGrid,
    PunishmentCellEditor,
    PunishmentPlayerList
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const roomStore = usePunishmentRoomStore()
    const notificationStore = useNotificationStore()
    const wordSetStore = useWordSetStore()

    // Room ID from route params
    const roomId = route.params.id

    // State
    const loading = ref(true)
    const showEditModal = ref(false)
    const editingCell = ref(null)
    const editingCellPosition = ref({ row: 0, col: 0 })
    const editingCellSide = ref('left')

    const newCell = ref({
      phrase: '',
      punishment: '',
      row: 0,
      col: 0,
      side: 'left'
    })

    // Sets selection
    const selectedWordSet = ref('')
    const selectedCreatorSet = ref('')
    const selectedPlayerSet = ref('')

    // Computed properties
    const roomData = computed(() => roomStore.currentRoom)
    const isRoomSetup = computed(() => roomStore.isRoomSetup)
    const isRoomActive = computed(() => roomStore.isRoomActive)
    const requiredCells = computed(() => roomStore.requiredCells)

    // Load room data and word sets on component mount
    onMounted(async () => {
      loading.value = true

      try {
        // Load the room
        await roomStore.loadRoom(roomId)

        // Load word sets
        await wordSetStore.loadWordSets()

        loading.value = false
      } catch (error) {
        console.error('Error loading room:', error)
        notificationStore.showNotification('Error loading room', 'error')
        router.push('/dashboard')
      }
    })

    // Edit a cell
    function editCell({row, col, side}) {
      const cellId = `${row}_${col}`
      const existingCell = roomData.value?.grid?.[cellId]

      editingCellPosition.value = { row, col }
      editingCellSide.value = side

      if (existingCell) {
        // Edit existing cell
        editingCell.value = existingCell
      } else {
        // Add new cell
        editingCell.value = null
      }

      showEditModal.value = true
    }

    // Cancel editing
    function cancelEdit() {
      showEditModal.value = false
      editingCell.value = null
    }

    // Save cell
    async function saveCell(cellData) {
      try {
        const result = await roomStore.addCell(
            cellData.position,
            cellData.phrase,
            cellData.punishment,
            cellData.side
        )

        if (result.success) {
          notificationStore.showNotification('Cell saved successfully', 'success')
          showEditModal.value = false
        } else {
          notificationStore.showNotification(result.error, 'error')
        }
      } catch (error) {
        console.error('Error saving cell:', error)
        notificationStore.showNotification('Error saving cell', 'error')
      }
    }

    // Add a cell through the form
    async function addManualCell() {
      const position = { row: newCell.value.row, col: newCell.value.col }
      const { phrase, punishment, side } = newCell.value

      // Handle column positioning based on side
      if (side === 'left' && position.col > 1) {
        position.col = 0
      } else if (side === 'right' && position.col < 2) {
        position.col = 2
      }

      try {
        const result = await roomStore.addCell(position, phrase, punishment, side)

        if (result.success) {
          notificationStore.showNotification('Cell added successfully', 'success')
          // Clear form
          newCell.value.phrase = ''
          newCell.value.punishment = ''
        } else {
          notificationStore.showNotification(result.error, 'error')
        }
      } catch (error) {
        console.error('Error adding cell:', error)
        notificationStore.showNotification('Error adding cell', 'error')
      }
    }

    // Apply word set (bingo words) to a specific side (left or right)
    async function applyWordSetToSide(side) {
      if (!selectedWordSet.value) return

      try {
        console.log(`Applying word set to ${side} side:`, selectedWordSet.value);

        // Find the selected set in our store
        const selectedSet = wordSetStore.wordSets.find(
            set => set.id === selectedWordSet.value
        );

        if (!selectedSet) {
          throw new Error('Selected word set not found');
        }

        console.log("Found word set:", selectedSet.name, "with", selectedSet.items.length, "items");

        if (!selectedSet.items || selectedSet.items.length === 0) {
          throw new Error('Selected word set is empty');
        }

        // Find cells on the specified side
        const cells = [];
        for (let row = 0; row < roomData.value.gridHeight; row++) {
          for (let col = (side === 'left' ? 0 : 2); col < (side === 'left' ? 2 : 4); col++) {
            const cellId = `${row}_${col}`;
            // Include all cells on this side - we'll update only the phrase part
            cells.push({
              row,
              col,
              existing: roomData.value.grid?.[cellId]
            });
          }
        }

        if (cells.length === 0) {
          throw new Error(`No cells available on ${side} side`);
        }

        console.log("Found", cells.length, "cells on", side, "side");

        // Shuffle the words for randomness
        const shuffledWords = [...selectedSet.items].sort(() => Math.random() - 0.5);

        let successCount = 0;

        // For each cell, keep the existing punishment (if any) but update the phrase
        for (let i = 0; i < Math.min(cells.length, shuffledWords.length); i++) {
          const cell = cells[i];

          // If there's an existing cell, get its punishment. Otherwise, use default
          let punishment = "Do nothing (phrase only)";
          if (cell.existing && cell.existing.punishment) {
            punishment = cell.existing.punishment;
          }

          const phrase = shuffledWords[i];

          console.log("Updating cell at position", cell, "phrase:", phrase, "existing punishment:", punishment);

          const result = await roomStore.addCell(
              { row: cell.row, col: cell.col },
              phrase,
              punishment,
              side
          );

          if (result.success) {
            successCount++;
          } else {
            console.error('Error adding word to cell:', result.error);
          }
        }

        if (successCount > 0) {
          notificationStore.showNotification(`Added/updated ${successCount} phrases on ${side} side`, 'success');
          selectedWordSet.value = ''; // Reset selection
        } else {
          throw new Error('Failed to add any phrases');
        }
      } catch (error) {
        console.error('Error applying word set:', error);
        notificationStore.showNotification(
            `Error applying word set: ${error.message}`,
            'error'
        );
      }
    }

    // Apply creator punishment set
    async function applyCreatorSet() {
      if (!selectedCreatorSet.value) return

      try {
        console.log("Applying creator set:", selectedCreatorSet.value);

        // Find the selected set in our store
        const selectedSet = wordSetStore.creatorPunishmentSets.find(
            set => set.id === selectedCreatorSet.value
        );

        if (!selectedSet) {
          throw new Error('Selected set not found');
        }

        console.log("Found set:", selectedSet.name, "with", selectedSet.items.length, "items");

        if (!selectedSet.items || selectedSet.items.length === 0) {
          throw new Error('Selected set is empty');
        }

        // Find cells on the creator side
        const cells = [];
        for (let row = 0; row < roomData.value.gridHeight; row++) {
          for (let col = 0; col < 2; col++) {
            const cellId = `${row}_${col}`;
            // Include all cells on creator side - we'll update only the punishment part
            cells.push({
              row,
              col,
              existing: roomData.value.grid?.[cellId]
            });
          }
        }

        if (cells.length === 0) {
          throw new Error('No cells available on creator side');
        }

        console.log("Found", cells.length, "cells");

        // Shuffle the punishments for randomness
        const shuffledItems = [...selectedSet.items].sort(() => Math.random() - 0.5);

        let successCount = 0;

        // Update punishments in cells, keeping phrases intact
        for (let i = 0; i < Math.min(cells.length, shuffledItems.length); i++) {
          const cell = cells[i];
          const punishment = shuffledItems[i];

          // Get existing phrase or use a placeholder if cell doesn't exist yet
          let phrase = "Bingo phrase";
          if (cell.existing && cell.existing.phrase) {
            phrase = cell.existing.phrase;
          }

          console.log("Updating cell punishment at position", cell, "punishment:", punishment, "existing phrase:", phrase);

          const result = await roomStore.addCell(
              { row: cell.row, col: cell.col },
              phrase,
              punishment,
              'left'
          );

          if (result.success) {
            successCount++;
          } else {
            console.error('Error updating cell punishment:', result.error);
          }
        }

        if (successCount > 0) {
          notificationStore.showNotification(`Updated ${successCount} creator punishments`, 'success');
          selectedCreatorSet.value = ''; // Reset selection
        } else {
          throw new Error('Failed to update any punishments');
        }
      } catch (error) {
        console.error('Error applying creator set:', error);
        notificationStore.showNotification(
            `Error applying creator set: ${error.message}`,
            'error'
        );
      }
    }

    // Apply player punishment set
    async function applyPlayerSet() {
      if (!selectedPlayerSet.value) return

      try {
        console.log("Applying player set:", selectedPlayerSet.value);

        // Find the selected set in our store
        const selectedSet = wordSetStore.playerPunishmentSets.find(
            set => set.id === selectedPlayerSet.value
        );

        if (!selectedSet) {
          throw new Error('Selected set not found');
        }

        console.log("Found set:", selectedSet.name, "with", selectedSet.items.length, "items");

        if (!selectedSet.items || selectedSet.items.length === 0) {
          throw new Error('Selected set is empty');
        }

        // Find cells on the player side
        const cells = [];
        for (let row = 0; row < roomData.value.gridHeight; row++) {
          for (let col = 2; col < 4; col++) {
            const cellId = `${row}_${col}`;
            // Include all cells on player side - we'll update only the punishment part
            cells.push({
              row,
              col,
              existing: roomData.value.grid?.[cellId]
            });
          }
        }

        if (cells.length === 0) {
          throw new Error('No cells available on player side');
        }

        console.log("Found", cells.length, "cells");

        // Shuffle the punishments for randomness
        const shuffledItems = [...selectedSet.items].sort(() => Math.random() - 0.5);

        let successCount = 0;

        // Update punishments in cells, keeping phrases intact
        for (let i = 0; i < Math.min(cells.length, shuffledItems.length); i++) {
          const cell = cells[i];
          const punishment = shuffledItems[i];

          // Get existing phrase or use a placeholder if cell doesn't exist yet
          let phrase = "Bingo phrase";
          if (cell.existing && cell.existing.phrase) {
            phrase = cell.existing.phrase;
          }

          console.log("Updating cell punishment at position", cell, "punishment:", punishment, "existing phrase:", phrase);

          const result = await roomStore.addCell(
              { row: cell.row, col: cell.col },
              phrase,
              punishment,
              'right'
          );

          if (result.success) {
            successCount++;
          } else {
            console.error('Error updating cell punishment:', result.error);
          }
        }

        if (successCount > 0) {
          notificationStore.showNotification(`Updated ${successCount} player punishments`, 'success');
          selectedPlayerSet.value = ''; // Reset selection
        } else {
          throw new Error('Failed to update any punishments');
        }
      } catch (error) {
        console.error('Error applying player set:', error);
        notificationStore.showNotification(
            `Error applying player set: ${error.message}`,
            'error'
        );
      }
    }

    // Remove a cell
    async function removeCell(cellId) {
      if (confirm('Are you sure you want to remove this cell?')) {
        try {
          const result = await roomStore.removeCell(cellId)

          if (result.success) {
            notificationStore.showNotification('Cell removed', 'success')
          } else {
            notificationStore.showNotification(result.error, 'error')
          }
        } catch (error) {
          console.error('Error removing cell:', error)
          notificationStore.showNotification('Error removing cell', 'error')
        }
      }
    }

    // Start the game
    async function startGame() {
      const cellCount = Object.keys(roomData.value?.grid || {}).length

      if (cellCount < requiredCells.value) {
        notificationStore.showNotification(
            `You need ${requiredCells.value} cells to start the game`,
            'warning'
        )
        return
      }

      try {
        const result = await roomStore.startGame()

        if (result.success) {
          notificationStore.showNotification('Game started successfully!', 'success')
        } else {
          notificationStore.showNotification(result.error, 'error')
        }
      } catch (error) {
        console.error('Error starting game:', error)
        notificationStore.showNotification('Error starting game', 'error')
      }
    }

    // Reset the game
    async function resetGame() {
      if (confirm('Are you sure you want to reset the game? This will clear all called cells and votes.')) {
        try {
          const result = await roomStore.resetGame()

          if (result.success) {
            notificationStore.showNotification('Game reset to setup mode', 'success')
          } else {
            notificationStore.showNotification(result.error, 'error')
          }
        } catch (error) {
          console.error('Error resetting game:', error)
          notificationStore.showNotification('Error resetting game', 'error')
        }
      }
    }

    // Handle cell click in active mode
    async function handleCellClick(cellId) {
      try {
        const result = await roomStore.markCellCompleted(cellId)

        if (result.success) {
          notificationStore.showNotification('Cell marked as completed', 'success')
        } else {
          notificationStore.showNotification(result.error, 'error')
        }
      } catch (error) {
        console.error('Error marking cell:', error)
        notificationStore.showNotification('Error marking cell', 'error')
      }
    }

    // Resolve a punishment
    async function resolvePunishment(cellId, completed) {
      try {
        const result = await roomStore.resolvePunishment(cellId, completed)

        if (result.success) {
          notificationStore.showNotification('Punishment resolved', 'success')
        } else {
          notificationStore.showNotification(result.error, 'error')
        }
      } catch (error) {
        console.error('Error resolving punishment:', error)
        notificationStore.showNotification('Error resolving punishment', 'error')
      }
    }

    // Copy room code to clipboard
    function copyRoomCode() {
      if (!roomData.value?.id) return

      navigator.clipboard.writeText(roomData.value.id)
          .then(() => {
            notificationStore.showNotification('Room code copied to clipboard', 'success')
          })
          .catch(err => {
            console.error('Could not copy text: ', err)
            notificationStore.showNotification('Failed to copy room code', 'error')
          })
    }

    // Cleanup on component unmount
    onUnmounted(() => {
      roomStore.cleanup()
    })

    return {
      loading,
      roomData,
      roomId,
      isRoomSetup,
      isRoomActive,
      requiredCells,
      showEditModal,
      editingCell,
      editingCellPosition,
      editingCellSide,
      newCell,
      selectedWordSet,
      selectedCreatorSet,
      selectedPlayerSet,
      wordSetStore,
      editCell,
      cancelEdit,
      saveCell,
      addManualCell,
      applyWordSetToSide,
      applyCreatorSet,
      applyPlayerSet,
      removeCell,
      startGame,
      resetGame,
      handleCellClick,
      resolvePunishment,
      copyRoomCode
    }
  }
}
</script>

<style scoped>
.status-badge {
  @apply text-xs py-1 px-2 rounded-full text-white;
}

.progress-bar {
  background-color: theme('colors.background.lighter');
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #FF4081;
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
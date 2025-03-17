<template>
  <BaseCard>
    <template #header>
      <h2 class="text-xl font-semibold">Setup Punishment Bingo</h2>
    </template>

    <div class="mb-4">
      <div class="progress-bar">
        <div
            class="progress"
            :style="`width: ${(Object.keys(grid).length / requiredCells) * 100}%`"
        ></div>
      </div>
      <div class="text-sm text-gray-400 mt-1">
        {{ Object.keys(grid).length }} / {{ requiredCells }} cells filled
      </div>
    </div>

    <!-- Word Sets Section -->
    <div class="mb-4">
      <label class="text-sm font-medium mb-2 block">Bingo Words Set</label>
      <BaseSelect
        v-model="localSelectedWordSet"
        placeholder="Select a word set..."
        :options="formattedWordSets"
        class="mb-2"
      />
      <div class="grid grid-cols-2 gap-2 mb-4">
        <button
            @click="applyWordSet('left')"
            class="btn bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
            :disabled="!localSelectedWordSet"
        >
          Apply to Creator Side
        </button>
        <button
            @click="applyWordSet('right')"
            class="btn bg-green-600 hover:bg-green-700 text-white text-sm py-2"
            :disabled="!localSelectedWordSet"
        >
          Apply to Player Side
        </button>
      </div>
    </div>

    <!-- Creator Punishment Sets Section -->
    <div class="mb-4">
      <label class="text-sm font-medium mb-2 block">Creator Punishment Sets</label>
      <BaseSelect
        v-model="localSelectedCreatorSet"
        placeholder="Select a set..."
        :options="formattedCreatorSets"
        class="mb-2"
      />
      <button
          @click="$emit('apply-creator-set')"
          class="btn bg-blue-600 hover:bg-blue-700 text-white w-full mb-4"
          :disabled="!localSelectedCreatorSet"
      >
        Apply to Creator Side
      </button>
    </div>

    <!-- Player Punishment Sets Section -->
    <div class="mb-4">
      <label class="text-sm font-medium mb-2 block">Player Punishment Sets</label>
      <BaseSelect
        v-model="localSelectedPlayerSet"
        placeholder="Select a set..."
        :options="formattedPlayerSets"
        class="mb-2"
      />
      <button
          @click="$emit('apply-player-set')"
          class="btn bg-green-600 hover:bg-green-700 text-white w-full mb-4"
          :disabled="!localSelectedPlayerSet"
      >
        Apply to Player Side
      </button>
    </div>

    <!-- Manual Cell Entry -->
    <div class="mb-6">
      <h3 class="text-md font-semibold mb-2">Add Individual Cell</h3>
      <form @submit.prevent="addCell" class="space-y-3">
        <div class="form-group">
          <label for="cellPhrase" class="text-sm">Phrase</label>
          <input
              type="text"
              id="cellPhrase"
              v-model="localNewCell.phrase"
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
              v-model="localNewCell.punishment"
              class="form-control"
              placeholder="Enter punishment"
              required
          />
        </div>

        <div class="form-group">
          <label for="cellSide" class="text-sm">Side</label>
          <select id="cellSide" v-model="localNewCell.side" class="form-control">
            <option value="left">Creator Side</option>
            <option value="right">Players Side</option>
          </select>
        </div>

        <div class="form-group">
          <label for="cellPosition" class="text-sm">Position</label>
          <div class="grid grid-cols-2 gap-2">
            <select id="cellRow" v-model="localNewCell.row" class="form-control">
              <option v-for="row in gridHeight" :key="row" :value="row-1">
                Row {{ row }}
              </option>
            </select>
            <select id="cellCol" v-model="localNewCell.col" class="form-control"
                    :disabled="true"
            >
              <option v-for="col in getValidColumns()" :key="col" :value="col-1">
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
        @click="$emit('start-game')"
        :disabled="Object.keys(grid).length < requiredCells"
        :class="['btn w-full', Object.keys(grid).length < requiredCells ? 'bg-gray-600 cursor-not-allowed' : 'btn-primary']"
    >
      {{ Object.keys(grid).length < requiredCells ? `Need ${requiredCells - Object.keys(grid).length} more cells` : 'Start Game' }}
    </button>
  </BaseCard>
</template>

<script>
import BaseCard from '@/components/base/BaseCard.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';

export default {
  name: 'RoomSetupPanel',
  components: {
    BaseCard,
    BaseSelect
  },
  props: {
    grid: {
      type: Object,
      required: true
    },
    requiredCells: {
      type: Number,
      required: true
    },
    gridHeight: {
      type: Number,
      required: true
    },
    wordSets: {
      type: Array,
      default: () => []
    },
    creatorPunishmentSets: {
      type: Array,
      default: () => []
    },
    playerPunishmentSets: {
      type: Array,
      default: () => []
    },
    selectedWordSet: {
      type: String,
      default: ''
    },
    selectedCreatorSet: {
      type: String,
      default: ''
    },
    selectedPlayerSet: {
      type: String,
      default: ''
    },
    newCell: {
      type: Object,
      default: () => ({
        phrase: '',
        punishment: '',
        row: 0,
        col: 0,
        side: 'left'
      })
    }
  },
  
  emits: [
    'word-set-select',
    'creator-set-select',
    'player-set-select',
    'apply-word-set',
    'apply-creator-set',
    'apply-player-set',
    'add-cell',
    'update-new-cell',
    'start-game'
  ],
  
  data() {
    return {
      localNewCell: {
        phrase: this.newCell.phrase || '',
        punishment: this.newCell.punishment || '',
        row: this.newCell.row || 0,
        col: this.newCell.col || 0,
        side: this.newCell.side || 'left'
      }
    };
  },
  
  computed: {
    localSelectedWordSet: {
      get() {
        return this.selectedWordSet;
      },
      set(value) {
        this.$emit('word-set-select', value);
      }
    },
    
    localSelectedCreatorSet: {
      get() {
        return this.selectedCreatorSet;
      },
      set(value) {
        this.$emit('creator-set-select', value);
      }
    },
    
    localSelectedPlayerSet: {
      get() {
        return this.selectedPlayerSet;
      },
      set(value) {
        this.$emit('player-set-select', value);
      }
    },
    
    formattedWordSets() {
      return this.wordSets.map(set => ({
        value: set.id,
        label: `${set.name} (${set.items?.length || 0} words)`
      }));
    },
    
    formattedCreatorSets() {
      return this.creatorPunishmentSets.map(set => ({
        value: set.id,
        label: `${set.name} (${set.items?.length || 0} items)`
      }));
    },
    
    formattedPlayerSets() {
      return this.playerPunishmentSets.map(set => ({
        value: set.id,
        label: `${set.name} (${set.items?.length || 0} items)`
      }));
    }
  },
  
  watch: {
    newCell: {
      handler(newVal) {
        this.localNewCell = { ...newVal };
      },
      deep: true
    },
    
    localNewCell: {
      handler(newVal) {
        this.$emit('update-new-cell', { ...newVal });
      },
      deep: true
    },
    
    'localNewCell.side': function(newVal) {
      // Automatically update column based on side
      if (newVal === 'left') {
        this.localNewCell.col = Math.min(this.localNewCell.col, 1);
      } else {
        this.localNewCell.col = Math.max(2, Math.min(this.localNewCell.col, 3));
      }
    }
  },
  
  methods: {
    getValidColumns() {
      // Return array [1,2] for left side or [3,4] for right side
      return this.localNewCell.side === 'left' ? [1, 2] : [3, 4];
    },
    
    applyWordSet(side) {
      if (!this.localSelectedWordSet) return;
      this.$emit('apply-word-set', side);
    },
    
    addCell() {
      this.$emit('add-cell');
      
      // Reset form fields but keep side
      const side = this.localNewCell.side;
      this.localNewCell = {
        phrase: '',
        punishment: '',
        row: 0,
        col: side === 'left' ? 0 : 2,
        side
      };
    }
  }
}
</script>

<style scoped>
.progress-bar {
  height: 8px;
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
<template>
  <BaseModal
      v-model="localVisible"
      title="Import from Word Set"
      size="medium"
  >
    <div v-if="wordSets.length === 0" class="text-center py-4 mb-6">
      <p class="text-gray-400 mb-2">You don't have any word sets yet.</p>
      <router-link to="/word-sets" class="text-primary hover:text-primary-light">
        Create a word set first
      </router-link>
    </div>

    <div v-else>
      <BaseSelect
          v-model="selectedSetId"
          label="Select a Word Set"
          placeholder="Select a set..."
          :options="wordSetOptions"
          class="mb-6"
      />

      <div v-if="selectedSetId" class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm text-gray-400">Word List Preview</h3>
          <span class="text-xs text-gray-500">{{ selectedSet ? selectedSet.items.length : 0 }} words</span>
        </div>
        <div class="bg-background-lighter p-3 rounded h-40 overflow-y-auto">
          <div v-if="selectedSet">
            <div v-for="(word, wordIndex) in selectedSet.items.slice(0, 10)" :key="wordIndex" class="text-sm mb-1">
              {{ word }}
            </div>
            <div v-if="selectedSet.items.length > 10" class="text-xs text-gray-500 italic mt-2">
              And {{ selectedSet.items.length - 10 }} more...
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
            @click="localVisible = false"
            class="btn bg-background-lighter hover:bg-gray-700 text-white"
        >
          Cancel
        </button>
        <button
            @click="importSet"
            class="btn btn-primary"
            :disabled="!selectedSetId"
        >
          Import Words
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/base/BaseModal.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';

export default {
  name: 'WordSetImporter',
  components: {
    BaseModal,
    BaseSelect
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    wordSets: {
      type: Array,
      required: true
    }
  },
  emits: ['update:visible', 'import-set'],

  data() {
    return {
      selectedSetId: ''
    }
  },

  computed: {
    localVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit('update:visible', value);
      }
    },

    selectedSet() {
      if (!this.selectedSetId) return null;
      return this.wordSets.find(set => set.id === this.selectedSetId);
    },

    wordSetOptions() {
      return this.wordSets.map(set => ({
        value: set.id,
        label: `${set.name} (${set.items.length} words)`
      }));
    }
  },

  watch: {
    visible(newVal) {
      if (!newVal) {
        this.selectedSetId = '';
      }
    }
  },

  methods: {
    importSet() {
      if (!this.selectedSetId) return;

      this.$emit('import-set', this.selectedSetId);
      this.localVisible = false;
    }
  }
}
</script>
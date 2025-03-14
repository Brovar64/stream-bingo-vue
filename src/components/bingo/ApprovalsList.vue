<template>
  <div v-if="approvals && approvals.length > 0" class="card mt-6">
    <h2 class="text-xl font-semibold mb-4">Pending Approvals</h2>
    <div class="space-y-4">
      <div 
        v-for="(approval, index) in approvals" 
        :key="index"
        class="bg-background-lighter p-4 rounded-lg"
      >
        <div class="flex flex-col md:flex-row md:justify-between md:items-center">
          <div class="mb-3 md:mb-0">
            <div class="font-medium">{{ approval.playerName }}</div>
            <div class="text-primary text-lg font-semibold">"{{ approval.word }}"</div>
            <div class="text-xs text-gray-400 mt-1">
              Cell: Row {{ approval.row + 1 }}, Column {{ approval.col + 1 }}
            </div>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="$emit('approve', index)"
              class="btn bg-success hover:bg-green-700 text-white"
            >
              Approve
            </button>
            <button 
              @click="$emit('reject', index)"
              class="btn bg-error hover:bg-red-700 text-white"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApprovalsList',
  props: {
    approvals: {
      type: Array,
      default: () => []
    }
  },
  emits: ['approve', 'reject']
}
</script>

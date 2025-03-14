<template>
  <div class="container py-12 text-center">
    <div class="max-w-lg mx-auto">
      <h1 class="text-6xl font-bold text-primary mb-6">404</h1>
      <h2 class="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p class="text-gray-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="space-y-4">
        <router-link to="/" class="btn btn-primary inline-block">
          Go Home
        </router-link>
        <div>
          <button @click="goBack" class="text-primary hover:text-primary-light">
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  methods: {
    goBack() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/')
    }
  }
}
</script>

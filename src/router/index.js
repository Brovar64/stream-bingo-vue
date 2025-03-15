import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/auth/LoginView.vue')
const DashboardView = () => import('@/views/dashboard/DashboardView.vue')
const AdminRoomView = () => import('@/views/room/AdminRoomView.vue')
const PlayerRoomView = () => import('@/views/room/PlayerRoomView.vue')
const VueFirePlayerView = () => import('@/views/room/VueFirePlayerView.vue')
const WordSetsView = () => import('@/views/WordSetsView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

// Routes configuration
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/room/:id',
    name: 'admin-room',
    component: AdminRoomView,
    meta: { requiresAuth: true }
  },
  {
    path: '/play/:id',
    name: 'player-room',
    component: PlayerRoomView
  },
  {
    path: '/play-new/:id',
    name: 'vuefire-player-room',
    component: VueFirePlayerView
  },
  {
    path: '/word-sets',
    name: 'word-sets',
    component: WordSetsView,
    props: { type: 'Word' },
    meta: { requiresAuth: true }
  },
  {
    path: '/punishment-sets/player',
    name: 'player-punishment-sets',
    component: WordSetsView,
    props: { type: 'Player Punishment' },
    meta: { requiresAuth: true }
  },
  {
    path: '/punishment-sets/creator',
    name: 'creator-punishment-sets',
    component: WordSetsView,
    props: { type: 'Creator Punishment' },
    meta: { requiresAuth: true }
  },
  {
    path: '/auth-callback',
    name: 'auth-callback',
    component: () => import('@/views/auth/AuthCallbackView.vue'),
    meta: { public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guards for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize before deciding
  if (!authStore.initialized) {
    await authStore.initialize()
  }
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

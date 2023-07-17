import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import { useUserStore } from '../stores/user'

const protectedRoutes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: SignUpView
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicyView
  }
]
const publicRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...protectedRoutes]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (
    protectedRoutes.find((route) => route.path === to.path) &&
    userStore.isAuthenticated === false
  ) {
    return next({ name: 'login' })
  }
  next()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import { useUserStore } from '../stores/user'

const publicRoutes = [
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicyView
  }
]
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
  const user = userStore.authUser

  if (to.path === '/dashboard' && !user) {
    userStore.logout()
    return next('/')
  }

  if ((to.path === '/' || to.path === '/sign-up') && user) {
    return next('/dashboard')
  }

  next()
})

export default router

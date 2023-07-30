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

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}')

  if (Object.keys(savedUser).length) {
    const lastLoggedIn = savedUser.lastLoginAt
    const lastLoggedInToNum = parseInt(lastLoggedIn)
    const lastLoggedInDate = new Date(lastLoggedInToNum)
    const currentDate = new Date()

    if (
      (currentDate.getTime() - lastLoggedInDate.getTime()) /
        1000 /
        60 /
        60 /
        24 >=
      30
    ) {
      await userStore.logout()
      router.push('/')
      return
    }
    userStore.currentUser = savedUser
  }

  if (to.path === '/dashboard' && !userStore.currentUser) {
    userStore.logout()
    return next('/')
  }

  if ((to.path === '/' || to.path === '/sign-up') && userStore.currentUser) {
    return next('/dashboard')
  }

  next()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { useUserStore } from '../stores/user'

const publicRoutes = [
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicyView
  },
  {
    path: '/:otherPath(.*)',
    name: 'not-found',
    component: NotFoundView
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

  routes: [...protectedRoutes, ...publicRoutes]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const savedUser = JSON.parse(localStorage.getItem('TM-user') || '{}')

  if (Object.keys(savedUser).length > 0) {
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
      router.push({ name: 'login' })
      return
    }
  }

  if (to.path === '/dashboard' && Object.keys(savedUser).length === 0) {
    userStore.logout()
    return next('/')
  }

  if (
    (to.path === '/' || to.path === '/sign-up') &&
    Object.keys(savedUser).length > 0
  ) {
    return next('/dashboard')
  }

  next()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    }
  ]
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')
  const userStore = useUserStore()

  if (to.path === '/dashboard' && !user) {
    userStore.logout()
    next('/')
    return
  }

  if ((to.path === '/' || to.path === '/sign-up') && user) {
    next('/dashboard')
    return
  }

  next()
})

export default router

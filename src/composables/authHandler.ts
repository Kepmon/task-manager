import { ref } from 'vue'
import router from '../router'

export const isAuthError = ref(false)
export const isPopupShown = ref(false)
export const handleAuthResponse = (response: boolean) => {
  if (!response) {
    isAuthError.value = true
  }

  if (response) {
    isAuthError.value = false
    setTimeout(() => {
      router.push(
        `${router.currentRoute.value.path === '/' ? '/dashboard' : '/'}`
      )
    }, 3000)
  }

  isPopupShown.value = true
  setTimeout(() => {
    isPopupShown.value = false
  }, 2000)
}

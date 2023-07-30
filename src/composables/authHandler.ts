import { ref } from 'vue'
import router from '../router'

export const isAuthError = ref(false)
export const isPopupShown = ref(false)

export const handleAuthResponse = (
  response: boolean | string,
  currentPath: string
) => {
  response === true ? (isAuthError.value = false) : (isAuthError.value = true)

  isPopupShown.value = true
  setTimeout(() => {
    isPopupShown.value = false
  }, 2000)

  if (response === true) {
    setTimeout(() => {
      router.push(`${currentPath === '/sign-up' ? '/' : '/dashboard'}`)
    }, 3000)
  }
}

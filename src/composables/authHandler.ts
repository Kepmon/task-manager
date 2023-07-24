import { ref } from 'vue'

export const isAuthError = ref(false)
export const isPopupShown = ref(false)

export const handleAuthResponse = (response: boolean | string) => {
  response === true ? (isAuthError.value = false) : (isAuthError.value = true)

  isPopupShown.value = true
  setTimeout(() => {
    isPopupShown.value = false
  }, 2000)
}

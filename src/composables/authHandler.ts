import type { Ref } from 'vue'
import { ref } from 'vue'
import router from '../router'

export const isAuthError = ref(false)
export const isPopupShown = ref(false)

export const handleAuthResponse = (
  response: boolean | string,
  currentPath: string,
  loading?: Ref<boolean>
) => {
  response === true ? (isAuthError.value = false) : (isAuthError.value = true)

  const durationOfShowingPopup = response === true ? 1500 : 2500
  isPopupShown.value = true
  setTimeout(() => {
    isPopupShown.value = false
  }, durationOfShowingPopup)

  if (response === true) {
    const pathToGo = {
      'sign-up': '/',
      '/': '/dashboard',
      '/dashboard': '/'
    }
    setTimeout(() => {
      router.push(pathToGo[currentPath as keyof typeof pathToGo])
    }, durationOfShowingPopup + 500)
  }

  if (loading != null) {
    setTimeout(() => {
      loading.value = false
    }, durationOfShowingPopup + 500)
  }
}

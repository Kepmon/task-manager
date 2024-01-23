import type { Ref } from 'vue'
import { ref } from 'vue'
import router from '../router'

export const isResponseError = ref(false)
export const isPopupShown = ref(false)

export const handleResponse = (
  response: boolean,
  currentPath?: string,
  loading?: Ref<boolean>
) => {
  const duration = 3000
  isResponseError.value = !response
  isPopupShown.value = true

  if (response && currentPath != null) {
    const pathToGo = {
      '/sign-up': '/',
      '/': '/dashboard',
      '/dashboard': '/'
    }

    setTimeout(() => {
      router.push(pathToGo[currentPath as keyof typeof pathToGo])
    }, 0)
  }

  setTimeout(() => {
    if (loading != null) {
      loading.value = false
    }

    isPopupShown.value = false
  }, duration)
}

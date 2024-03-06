import type { Ref } from 'vue'
import { ref } from 'vue'

export const isResponseError = ref(false)
export const isPopupShown = ref(false)

export const handleResponse = (
  response: boolean,
  currentPath?: '/' | '/sign-up' | '/dashboard',
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

    setTimeout(async () => {
      await navigateTo(pathToGo[currentPath])
    }, 0)
  }

  setTimeout(() => {
    if (loading != null) {
      loading.value = false
    }

    isPopupShown.value = false
  }, duration)
}

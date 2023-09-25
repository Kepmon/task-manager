import type { Ref } from 'vue'
import { ref } from 'vue'
import router from '../router'

export const isResponseError = ref(false)

export const handleResponse = (
  response: true | string,
  currentPath?: string,
  loading?: Ref<boolean>
) => {
  const duration = 3000
  isResponseError.value = response === true ? false : true

  if (response !== true) {
    setTimeout(() => {
      if (loading != null) {
        loading.value = false
      }

      isResponseError.value = false
    }, duration)
    return
  }

  if (response === true && currentPath != null) {
    const pathToGo = {
      '/sign-up': '/',
      '/': '/dashboard',
      '/dashboard': '/'
    }
    router.push(pathToGo[currentPath as keyof typeof pathToGo])
  }
}

import type { Ref } from 'vue'
import { ref } from 'vue'
import router from '../router'

export const isAuthError = ref(false)

export const handleAuthResponse = (
  response: boolean | string | void,
  currentPath: string,
  loading?: Ref<boolean>
) => {
  const duration = 3000
  isAuthError.value = response === true ? false : true

  if (response !== true) {
    setTimeout(() => {
      isAuthError.value = false
    }, duration)
  }

  if (response === true) {
    const pathToGo = {
      '/sign-up': '/',
      '/': '/dashboard',
      '/dashboard': '/'
    }
    router.push(pathToGo[currentPath as keyof typeof pathToGo])
  }

  if (loading != null) {
    setTimeout(() => {
      loading.value = false
    }, duration)
  }
}

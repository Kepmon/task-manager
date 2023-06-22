import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase'
import {
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserCredential['user'] | null>(null)

  type Method =
    | typeof createUserWithEmailAndPassword
    | typeof signInWithEmailAndPassword

  const handleAuth = async (
    method: Method,
    email: string,
    password: string,
    currentPath: string
  ) => {
    try {
      const request = await method(auth, email, password)

      if (currentPath === '/') {
        user.value = request.user
      }

      if (currentPath === '/sign-up') {
        await logOutUser()
      }

      return true
    } catch (err) {
      return false
    }
  }

  const logOutUser = async () => {
    try {
      await signOut(auth)
      return true
    } catch (err) {
      return false
    }
  }

  return {
    user,
    handleAuth,
    logOutUser
  }
})

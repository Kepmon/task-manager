import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase.js'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)

  type Method = typeof createUserWithEmailAndPassword | typeof signInWithEmailAndPassword
  const handleAuth = async (
    method: Method, email: string | null, password: string | null, currentPath: string
  ) => {

    if (email && password) {
      try {
        await method(auth, email, password)

        if (currentPath === '/') {
          isLoggedIn.value = true
        }

        if (currentPath === '/sign-up') {
          await logOutUser()
        }

        return true
      }
      catch (err) {
        return false
      }
    }
  }

  const logOutUser = async () => {
    try {
      await signOut(auth)

      return true
    }
    catch (err) {
      return false
    }
  }

  return {
    isLoggedIn, handleAuth
  }
})
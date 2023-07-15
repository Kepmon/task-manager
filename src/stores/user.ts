import { defineStore } from 'pinia'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { useBoardsNewStore } from './boardsNew'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  type Method =
    | typeof createUserWithEmailAndPassword
    | typeof signInWithEmailAndPassword

  const userID = ref('')
  const { getBoardsData } = useBoardsNewStore()

  const handleAuth = async (
    method: Method,
    email: string,
    password: string,
    currentPath: string
  ) => {
    try {
      const response = await method(auth, email, password)

      if (response && currentPath === '/sign-up') {
        await logout()
      }

      if (!response) throw new Error()

      return true
    } catch (err) {
      return err.code
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      return true
    } catch (err) {
      return false
    }
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      userID.value = user.uid
      await getBoardsData(user.uid)
      return
    }

    localStorage.removeItem('user')
  })

  return {
    handleAuth,
    logout,
    userID
  }
})

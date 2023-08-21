import { defineStore } from 'pinia'
import type { AuthError } from 'firebase/auth'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, usersColRef } from '../firebase'
import { computed } from 'vue'
import { useBoardsStore } from './boards'

export const useUserStore = defineStore('user', () => {
  const userID = computed(() => {
    const activeUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (Object.keys(activeUser).length !== 0) {
      return activeUser.uid
    }

    return null
  })

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      localStorage.removeItem('user')
      return
    }

    localStorage.setItem('user', JSON.stringify(user))
  })

  const register = async (email: string, password: string) => {
    try {
      const authResponse = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (!authResponse) throw new Error()

      await setDoc(doc(usersColRef, authResponse.user.uid), {
        userID: authResponse.user.uid
      })

      await logout()

      return true
    } catch (err) {
      return (err as AuthError).code
    }
  }

  const logIn = async (email: string, password: string) => {
    try {
      const authResponse = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (!authResponse) throw new Error()

      return true
    } catch (err) {
      return (err as AuthError).code
    }
  }

  const logout = async () => {
    try {
      const boardsStore = useBoardsStore()
      boardsStore.removeBoardsSnapshot()

      await signOut(auth)

      return true
    } catch (err) {
      return false
    }
  }

  return {
    userID,
    register,
    logIn,
    logout
  }
})

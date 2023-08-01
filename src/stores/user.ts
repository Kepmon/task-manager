import { defineStore } from 'pinia'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  AuthError
} from 'firebase/auth'
import { addDoc } from 'firebase/firestore'
import { auth, usersColRef } from '../firebase'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userID = ref<null | string>(null)

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      localStorage.removeItem('user')
      return
    }

    userID.value = user.uid
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

      await addDoc(usersColRef, {
        userID: userID.value
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
      await signOut(auth)
      localStorage.removeItem('user')
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

import { defineStore } from 'pinia'
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  AuthError
} from 'firebase/auth'
import { addDoc, updateDoc } from 'firebase/firestore'
import { auth, colRef } from '../firebase'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<null | User>(null)

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      currentUser.value = null
      localStorage.removeItem('user')
      return
    }

    localStorage.setItem('user', JSON.stringify(user))
    currentUser.value = user
  })

  const register = async (email: string, password: string) => {
    try {
      const authResponse = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (!authResponse) throw new Error()

      const docResponse = await addDoc(colRef, {
        userID: (currentUser.value as User).uid,
        boards: []
      })

      if (docResponse) {
        updateDoc(docResponse, {
          userDocID: docResponse.id
        })
      }

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
      return true
    } catch (err) {
      return false
    }
  }

  return {
    currentUser,
    register,
    logIn,
    logout
  }
})

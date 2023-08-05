import { defineStore } from 'pinia'
import type { AuthError } from 'firebase/auth'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { query, where, getDocs, addDoc } from 'firebase/firestore'
import { auth, usersColRef } from '../firebase'
import { ref } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'

export const useUserStore = defineStore('user', () => {
  const userID = ref<null | string>(null)
  const userDocID = ref<null | string>(null)

  const boardsStore = useBoardsStore()
  const tasksStore = useTasksStore()

  const isLoading = ref(true)
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      localStorage.removeItem('user')
      return
    }

    userID.value = user.uid
    localStorage.setItem('user', JSON.stringify(user))

    const activeUserColRef = query(usersColRef, where('userID', '==', user.uid))
    const activeUserDocID = (await getDocs(activeUserColRef)).docs[0].id

    await boardsStore.getBoardsData(activeUserDocID)
    await tasksStore.getTasksData(activeUserDocID)

    isLoading.value = false
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
    isLoading,
    userID,
    userDocID,
    register,
    logIn,
    logout
  }
})

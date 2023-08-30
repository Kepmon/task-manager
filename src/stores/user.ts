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
import { ref } from 'vue'
import { useBoardsStore } from './boards'

export const useUserStore = defineStore('user', () => {
  const userID = ref<null | string>(null)

  const boardsStore = useBoardsStore()
  const isLoading = ref(true)

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      localStorage.removeItem('user')
      return
    }

    userID.value = user.uid
    localStorage.setItem('user', JSON.stringify(user))

    await boardsStore.getBoards()

    const savedBoardJSON = localStorage.getItem(`currentBoard-${userID.value}`)
    if (savedBoardJSON != null) {
      boardsStore.currentBoard = JSON.parse(savedBoardJSON as string)
      await boardsStore.getColumns()
      isLoading.value = false
      return
    }

    if (boardsStore.boards.length !== 0) {
      boardsStore.currentBoard = boardsStore.boards[0]
      localStorage.setItem(
        `currentBoard-${userID.value}`,
        JSON.stringify(boardsStore.currentBoard)
      )
    }

    await boardsStore.getColumns()
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
      await signOut(auth)

      return true
    } catch (err) {
      return false
    }
  }

  return {
    isLoading,
    userID,
    register,
    logIn,
    logout
  }
})

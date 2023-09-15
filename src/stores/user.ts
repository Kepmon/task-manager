import type { AuthError, User } from 'firebase/auth'
import { defineStore } from 'pinia'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { auth, usersColRef, db } from '../firebase'
import { ref } from 'vue'
import { useBoardsStore } from './boards'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<null | User>(null)
  const userID = ref<null | string>(null)
  const inputedPassword = ref<null | string>(null)

  const boardsStore = useBoardsStore()
  const isLoading = ref(true)

  onAuthStateChanged(auth, async (user) => {
    if (user == null) {
      localStorage.removeItem('TM-user')
      currentUser.value = null
      return
    }

    currentUser.value = user
    userID.value = user.uid
    localStorage.setItem('TM-user', JSON.stringify(user))

    await boardsStore.getBoards()

    const savedBoardJSON = localStorage.getItem(
      `TM-currentBoard-${userID.value}`
    )
    if (savedBoardJSON != null) {
      boardsStore.currentBoard = JSON.parse(savedBoardJSON as string)
      await boardsStore.getColumns()
      isLoading.value = false
      return
    }

    if (boardsStore.boards.length !== 0) {
      boardsStore.currentBoard = boardsStore.boards[0]
      localStorage.setItem(
        `TM-currentBoard-${userID.value}`,
        JSON.stringify(boardsStore.currentBoard)
      )
    }

    if (boardsStore.boards.length > 0) {
      await boardsStore.getColumns()
    }

    isLoading.value = false
  })

  const register = async (email: string, password: string) => {
    try {
      const authResponse = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (authResponse == null) throw new Error()

      await setDoc(doc(usersColRef, authResponse.user.uid), {})

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
      return (err as AuthError).code
    }
  }

  const deleteAccount = async () => {
    const user = auth.currentUser

    try {
      const boardsColRef = collection(db, `users/${(user as User).uid}/boards`)
      const boardsDocRefs = (await getDocs(boardsColRef)).docs

      if (boardsDocRefs.length > 0) {
        boardsDocRefs.forEach(async (docRef) => {
          const boardDoc = docRef.id
          await boardsStore.deleteBoard(boardDoc)
        })
      }
      const userDocRef = doc(usersColRef, (user as User).uid)
      await deleteDoc(userDocRef)

      const credential = EmailAuthProvider.credential(
        (user as User).email as string,
        inputedPassword.value as string
      )
      await reauthenticateWithCredential(user as User, credential)
      await deleteUser(user as User)

      userID.value = null

      return true
    } catch (err) {
      return (err as AuthError).code
    }
  }

  return {
    isLoading,
    userID,
    inputedPassword,
    register,
    logIn,
    logout,
    deleteAccount
  }
})

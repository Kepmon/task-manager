import type { AuthError, User } from 'firebase/auth'
import type { FirestoreError } from 'firebase/firestore'
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
import { computed, ref } from 'vue'
import { useBoardsStore } from './boards'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<null | User>(null)
  const userID = computed(() =>
    currentUser.value != null ? currentUser.value.uid : null
  )
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
    localStorage.setItem('TM-user', JSON.stringify(user))

    try {
      const response = await boardsStore.getBoards()

      if (response !== true) throw new Error(response)
    } catch (err) {
      return (err as FirestoreError).code
    }

    const savedBoardJSON = localStorage.getItem(
      `TM-currentBoard-${userID.value}`
    )
    if (savedBoardJSON != null) {
      boardsStore.currentBoard = JSON.parse(savedBoardJSON as string)
      try {
        const response = await boardsStore.getColumns()

        if (response !== true) throw new Error(response)
      } catch (err) {
        return (err as FirestoreError).code
      }
      isLoading.value = false
      return
    }

    if (boardsStore.boards.length > 0) {
      try {
        const boardResponse = await boardsStore.saveCurrentBoard(
          boardsStore.boards[0]
        )
        const columnsResponse = await boardsStore.getColumns()

        if (boardResponse !== true) throw new Error(boardResponse)
        if (columnsResponse !== true) throw new Error(columnsResponse)

        isLoading.value = false
      } catch (err) {
        isLoading.value = false

        return (err as FirestoreError).code
      }
    }

    isLoading.value = false
  })

  const register = async (email: string, password: string) => {
    type RegisterError = FirestoreError | AuthError

    try {
      const authResponse = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (authResponse == null) throw new Error()

      try {
        await setDoc(doc(usersColRef, authResponse.user.uid), {})
        await logout()
      } catch (err) {
        return (err as RegisterError).code
      }

      return true
    } catch (err) {
      return (err as RegisterError).code
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

    const credential = EmailAuthProvider.credential(
      (user as User).email as string,
      inputedPassword.value as string
    )

    try {
      await reauthenticateWithCredential(user as User, credential)
    } catch (err) {
      return (err as AuthError).code
    }

    try {
      const boardsColRef = collection(db, `users/${(user as User).uid}/boards`)
      const boardsDocRefs = (await getDocs(boardsColRef)).docs

      if (boardsDocRefs.length > 0) {
        boardsDocRefs.forEach(async (docRef) => {
          const boardDoc = docRef.id

          try {
            const response = await boardsStore.deleteBoard(boardDoc)

            if (response !== true) throw new Error(response)
          } catch (err) {
            return (err as FirestoreError).code
          }
        })
      }
      const userDocRef = doc(usersColRef, (user as User).uid)

      try {
        await deleteDoc(userDocRef)
      } catch (err) {
        return (err as FirestoreError).code
      }

      try {
        await deleteUser(user as User)
      } catch (err) {
        return (err as AuthError).code
      }

      return true
    } catch (err) {
      return (err as AuthError | FirestoreError).code
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

import type { UserData } from '../api/boardsTypes'
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
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { auth, usersColRef } from '../firebase'
import { computed, ref } from 'vue'
import { useBoardsStore } from './boards'
import { useFormsStore } from './forms'
import { returnEmptyUserData } from './helpers/userHelpers'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<null | User>(null)
  const userID = computed(() =>
    currentUser.value != null ? currentUser.value.uid : null
  )
  const inputedPassword = ref<null | string>(null)
  const isLoading = ref(true)
  const userData = ref<UserData>(returnEmptyUserData())

  onAuthStateChanged(auth, async (user) => {
    if (user == null) {
      localStorage.removeItem('TM-user')
      currentUser.value = null
      return
    }

    currentUser.value = user
    localStorage.setItem('TM-user', JSON.stringify(user))

    const savedUserData = JSON.parse(
      localStorage.getItem(`TM-userData-${userID.value}`) || '{}'
    )

    if (Object.keys(savedUserData).length > 0) {
      userData.value = savedUserData
      isLoading.value = false
      return
    }

    const boardsStore = useBoardsStore()
    const boards = await boardsStore.getBoards()
    userData.value.allBoards = boards

    await boardsStore.fetchNewBoard(boards[0])
    saveUserData(true)

    isLoading.value = false
  })

  const saveUserData = (resetEditForm?: true) => {
    localStorage.setItem(
      `TM-userData-${userID.value}`,
      JSON.stringify(userData.value)
    )

    if (resetEditForm) {
      const formsStore = useFormsStore()
      formsStore.resetFormData('board', 'edit')
    }
  }

  const register = async (email: string, password: string) => {
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
        return {
          ok: false,
          errorMessage: (err as AuthError).code
        }
      }

      return {
        ok: true,
        errorMessage: ''
      }
    } catch (err) {
      return {
        ok: false,
        errorMessage: (err as AuthError).code
      }
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

      return {
        ok: true,
        errorMessage: ''
      }
    } catch (err) {
      return {
        ok: false,
        errorMessage: (err as AuthError).code
      }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      userData.value = returnEmptyUserData()

      return true
    } catch (err) {
      return false
    }
  }

  const deleteAccount = async () => {
    if (currentUser.value == null || userID.value == null) return
    const accountID = userID.value

    const credential = EmailAuthProvider.credential(
      currentUser.value.email as string,
      inputedPassword.value as string
    )

    try {
      await reauthenticateWithCredential(currentUser.value, credential)
    } catch (err) {
      return false
    }

    try {
      const allBoards = userData.value.allBoards

      if (allBoards.length > 0) {
        await Promise.all(
          allBoards.map(async ({ boardID }) => {
            const boardsStore = useBoardsStore()

            const response = await boardsStore.deleteBoard(boardID)

            if (response === false) throw new Error()
          })
        )
      }

      const userDocRef = doc(usersColRef, userID.value)

      await deleteDoc(userDocRef)
      await deleteUser(currentUser.value)

      userData.value = returnEmptyUserData()
      localStorage.removeItem(`TM-userData-${accountID}`)

      return true
    } catch (err) {
      return false
    }
  }

  return {
    isLoading,
    userID,
    userData,
    inputedPassword,
    saveUserData,
    register,
    logIn,
    logout,
    deleteAccount
  }
})

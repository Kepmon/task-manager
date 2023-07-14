import type { ActiveUser } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { auth, colRef } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { addDoc, getDocs } from 'firebase/firestore'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  type Method =
    | typeof createUserWithEmailAndPassword
    | typeof signInWithEmailAndPassword

  const activeUser = ref<ActiveUser | null>(null)

  const handleAuth = async (
    method: Method,
    email: string,
    password: string,
    currentPath: string
  ) => {
    try {
      const response = await method(auth, email, password)

      if (response && currentPath === '/sign-up') {
        await addDoc(colRef, { userID: response.user.uid, boards: [] })
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
    if (user != null) {
      const allUsersRef = await getDocs(colRef)
      const allUsers = allUsersRef.docs.map((doc) => doc.data())
      const currentUser = allUsers.find(
        (eachUser) => eachUser.userID === user.uid
      )

      localStorage.setItem('user', JSON.stringify(user))
      activeUser.value = currentUser as ActiveUser
      return
    }

    activeUser.value = null
    localStorage.removeItem('user')
  })

  return {
    handleAuth,
    logout,
    activeUser
  }
})

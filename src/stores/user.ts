import { defineStore } from 'pinia'
import { auth, colRef } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { addDoc } from 'firebase/firestore'

export const useUserStore = defineStore('user', () => {
  type Method =
    | typeof createUserWithEmailAndPassword
    | typeof signInWithEmailAndPassword

  const handleAuth = async (
    method: Method,
    email: string,
    password: string,
    currentPath: string
  ) => {
    try {
      const response = await method(auth, email, password)

      if (response && currentPath === '/sign-up') {
        await addDoc(colRef, { userID: response.user.uid })
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

  onAuthStateChanged(auth, (user) => {
    if (user != null) {
      localStorage.setItem('user', JSON.stringify(user))
      return
    }

    localStorage.removeItem('user')
  })

  return {
    handleAuth,
    logout
  }
})

import { defineStore } from 'pinia'
import type { AuthError } from 'firebase/auth'
import type { DocumentData, Query } from 'firebase/firestore'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore'
import { auth, usersColRef } from '../firebase'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userID = ref<null | string>(null)
  const userDocID = ref<null | string>(null)
  const activeUserColRef = ref<null | Query<DocumentData>>(null)
  const activeUserDocID = ref('')

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      localStorage.removeItem('user')
      return
    }

    userID.value = user.uid
    localStorage.setItem('user', JSON.stringify(user))

    activeUserColRef.value = query(usersColRef, where('userID', '==', user.uid))
    activeUserDocID.value = (await getDocs(activeUserColRef.value)).docs[0].id
  })

  const register = async (email: string, password: string) => {
    try {
      const authResponse = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (!authResponse) throw new Error()

      const addedUserDoc = await addDoc(usersColRef, {
        userID: userID.value
      })

      await updateDoc(addedUserDoc, {
        docID: addedUserDoc.id
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
    activeUserDocID,
    activeUserColRef,
    userID,
    userDocID,
    register,
    logIn,
    logout
  }
})

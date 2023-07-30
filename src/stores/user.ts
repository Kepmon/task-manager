import { defineStore } from 'pinia'
import { useAuth } from '@vueuse/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { doc, addDoc, updateDoc, DocumentReference } from 'firebase/firestore'
import { colRef, firebaseAuth } from '../firebase'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const { isAuthenticated, user: authUser } = useAuth(firebaseAuth)

  const docID = ref<null | DocumentReference['id']>(null)

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password)

      if (!authUser.value) throw new Error()

      if (authUser.value) {
        const response = await addDoc(colRef, {
          userID: authUser.value?.uid,
          boards: []
        })

        docID.value = response.id
        const docRef = doc(colRef, response.id)
        await updateDoc(docRef, {
          docID: response.id
        })

        await logout()
      }

      return true
    } catch (err) {
      return err.code
    }
  }

  const logIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)

      if (!authUser.value) throw new Error()

      if (authUser.value) {
        localStorage.setItem('user', JSON.stringify(authUser.value))
      }

      return true
    } catch (err) {
      return err.code
    }
  }

  const logout = async () => {
    try {
      await signOut(firebaseAuth)
      localStorage.removeItem('user')
      return true
    } catch (err) {
      return false
    }
  }

  return {
    isAuthenticated,
    authUser,
    register,
    logIn,
    logout
  }
})

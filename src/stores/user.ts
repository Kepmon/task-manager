import { defineStore } from 'pinia'
import { useAuth } from '@vueuse/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { addDoc } from 'firebase/firestore'
import { colRef, firebaseAuth } from '../firebase'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  const { isAuthenticated, user: authUser } = useAuth(firebaseAuth)
  const register = async (email: string, password: string) => {
    const router = useRouter()

    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password)

      if (!authUser.value) throw new Error()

      if (authUser.value) {
        await addDoc(colRef, {
          userID: authUser.value?.uid,
          boards: []
        })

        setTimeout(() => {
          router.push('/')
        }, 3000)

        await logout()
      }

      return true
    } catch (err) {
      return err.code
    }
  }

  const logIn = async (email: string, password: string) => {
    const router = useRouter()
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)

      if (!authUser.value) throw new Error()

      if (authUser.value) {
        localStorage.setItem('user', JSON.stringify(authUser.value))
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
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

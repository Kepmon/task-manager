import { defineStore } from 'pinia'
import { useAuth } from '@vueuse/firebase'
import { db, firebaseAuth } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { useBoardsStore } from './boards'

export const useUserStore = defineStore('user', () => {
  const { isAuthenticated, user: authUser } = useAuth(firebaseAuth)
  const boardsStore = useBoardsStore()

  async function init(uid: string) {
    await setDoc(doc(db, 'users', uid), {
      id: nanoid(8),
      uid: uid,
      boards: [boardsStore.add('Sample board')]
    })
  }

  return {
    isAuthenticated,
    init,
    user: authUser
  }
})

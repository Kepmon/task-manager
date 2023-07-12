import type { ActiveUser } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { ref, toRefs } from 'vue'
import type { Board } from '../api/boardsTypes'
import { db, colRef } from '../firebase'
import { getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const isConfirmationPopupShown = ref(false)

  const showPopup = () => {
    isConfirmationPopupShown.value = true
    setTimeout(() => {
      isConfirmationPopupShown.value = false
    }, 2000)
  }

  const addNewBoard = async (name: string, columns: string[]) => {
    const { activeUser } = toRefs(useUserStore())
    const uid = (activeUser.value as ActiveUser).userID

    const requiredDocRef = query(colRef, where('userID', '==', uid))
    const docSnap = await getDocs(requiredDocRef)
    const docID = docSnap.docs[0].id
    const docRef = doc(db, 'users', docID)
    const boardColumns = columns.map((column) => ({
      name: column,
      tasks: []
    }))

    await updateDoc(docRef, {
      boards: [
        ...boards.value,
        {
          name,
          columns: boardColumns
        }
      ]
    })

    showPopup()
  }

  return {
    boards,
    addNewBoard,
    isConfirmationPopupShown,
    currentBoard
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Board } from '../api/boardsTypes'
import { db, colRef } from '../firebase'
import { getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const boards: Ref<Board[]> = ref([])

  const addNewBoard = async (name: string, columns: string[]) => {
    const { uid } = JSON.parse(localStorage.getItem('user') || '{}')
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
        {
          name,
          columns: boardColumns
        }
      ]
    })
  }

  return {
    boards,
    addNewBoard
  }
})

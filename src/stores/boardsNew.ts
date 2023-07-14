import type { ActiveUser, Board, BoardColumn } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { ref, toRefs, computed } from 'vue'
import { db, colRef } from '../firebase'
import { getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const boardColumns = computed(() =>
    currentBoard.value ? currentBoard.value.columns : null
  )
  const boardColumnsNames = computed(() =>
    boardColumns.value?.map((column) => column.name)
  )
  const isConfirmationPopupShown = ref(false)

  const showPopup = () => {
    isConfirmationPopupShown.value = true
    setTimeout(() => {
      isConfirmationPopupShown.value = false
    }, 2000)
  }

  const getBoardsData = async (columns: string[]) => {
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

    return { docRef, boardColumns }
  }

  const addNewBoard = async (name: string, columns: string[]) => {
    const { docRef, boardColumns } = await getBoardsData(columns)

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

  const editBoard = async (name: string, columns: string[]) => {
    const { docRef, boardColumns } = await getBoardsData(columns)

    const otherBoards = ref(
      boards.value.filter((board) => board !== currentBoard.value)
    )

    await updateDoc(docRef, {
      boards: [
        ...otherBoards.value,
        {
          name,
          columns: boardColumns
        }
      ]
    })
  }

  return {
    boards,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    addNewBoard,
    editBoard,
    isConfirmationPopupShown
  }
})

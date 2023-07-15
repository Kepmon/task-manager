import type { Board } from '../api/boardsTypes'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { ref, toRefs, computed } from 'vue'
import { db, boardsColRef } from '../firebase'
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
  const { userID } = toRefs(useUserStore())

  const showPopup = () => {
    isConfirmationPopupShown.value = true
    setTimeout(() => {
      isConfirmationPopupShown.value = false
    }, 2000)
  }

  const getBoardsData = async () => {
    const requiredDocRef = query(
      boardsColRef,
      where('userID', '==', userID.value)
    )
    const docSnap = await getDocs(requiredDocRef)
    const [documentRef] = docSnap.docs
    const docRef = doc(db, 'users', documentRef.id)

    return { docRef }
  }

  const addNewBoard = async (board: Omit<Board, 'id'>) => {
    const { docRef } = await getBoardsData()

    await updateDoc(docRef, {
      boards: [
        ...boards.value,
        {
          id: nanoid(),
          name: board.name,
          columns: board.columns
        }
      ]
    })

    showPopup()
  }

  const editBoard = async (board: Omit<Board, 'id'>) => {
    const { docRef } = await getBoardsData()

    const otherBoards = boards.value.filter(
      (board) => board !== currentBoard.value
    )

    await updateDoc(docRef, {
      boards: [
        ...otherBoards,
        {
          name: board.name,
          columns: board.columns
        }
      ]
    })

    showPopup()
  }

  return {
    boards,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    getBoardsData,
    addNewBoard,
    editBoard,
    isConfirmationPopupShown
  }
})

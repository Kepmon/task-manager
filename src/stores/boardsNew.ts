import type { Board } from '../api/boardsTypes'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { ref, toRefs, computed } from 'vue'
import { db, colRef } from '../firebase'
import { getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const { activeUser } = toRefs(useUserStore())
  const { getUser } = useUserStore()
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

  const getBoardsData = async () => {
    if (activeUser.value == null) {
      await getUser()
    }

    if (!activeUser.value) {
      throw Error('Failed to retrieve user')
    }

    const requiredDocRef = query(
      colRef,
      where('userID', '==', activeUser.value.userID)
    )
    const docSnap = await getDocs(requiredDocRef)
    const [documentRef] = docSnap.docs
    const docRef = doc(db, 'users', documentRef.id)
    boards.value = activeUser.value.boards

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

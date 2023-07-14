import type { Board } from '../api/boardsTypes'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { ref, computed } from 'vue'
import { db, colRef } from '../firebase'
import { getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const userStore = useUserStore()
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
    if (userStore.activeUser == null) {
      await userStore.getUser()
    }

    if (!userStore.activeUser) {
      throw Error('Failed to retrive user')
    }

    const requiredDocRef = query(
      colRef,
      where('userID', '==', userStore.activeUser.userID)
    )
    const docSnap = await getDocs(requiredDocRef)
    const [documentRef] = docSnap.docs
    const docRef = doc(db, 'users', documentRef.id)

    return { docRef, boards: userStore.activeUser.boards }
  }

  const addNewBoard = async (board: Omit<Board, 'id'>) => {
    const { docRef, boards } = await getBoardsData()

    await updateDoc(docRef, {
      boards: [
        ...boards,
        {
          id: nanoid(),
          name: board.name,
          columns: board.columns
        }
      ]
    })

    showPopup()
  }

  const editBoard = async (name: string, columns: string[]) => {
    const { docRef, boards } = await getBoardsData()

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

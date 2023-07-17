import type { Board } from '../api/boardsTypes'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { ref, computed } from 'vue'
import { db } from '../firebase'
import { getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const userStore = useUserStore()
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const isConfirmationPopupShown = ref(false)

  const showPopup = () => {
    isConfirmationPopupShown.value = true
    setTimeout(() => {
      isConfirmationPopupShown.value = false
    }, 2000)
  }

  const boardColumns = computed(() =>
    currentBoard.value ? currentBoard.value.columns : null
  )
  const boardColumnsNames = computed(() =>
    boardColumns.value?.map((column) => column.name)
  )

  // const getBoardsData = async () => {
  //   if (userStore.activeUser == null) {
  //     return
  //   }

  //   const requiredDocRef = query(
  //     usersDocument,
  //     where('userID', '==', userStore.activeUser.userID)
  //   )
  //   const docSnap = await getDocs(requiredDocRef)
  //   const [documentRef] = docSnap.docs
  //   const docRef = doc(db, 'users', documentRef.id)
  //   boards.value = userStore.activeUser.boards

  //   return docRef
  // }

  // const addNewBoard = async (board: Omit<Board, 'id'>) => {
  //   const docRef = await getBoardsData()

  //   if (docRef == null) {
  //     return
  //   }

  //   await updateDoc(docRef, {
  //     boards: [
  //       ...boards.value,
  //       {
  //         id: nanoid(),
  //         name: board.name,
  //         columns: board.columns
  //       }
  //     ]
  //   })

  //   showPopup()
  // }

  // const editBoard = async (board: Omit<Board, 'id'>) => {
  //   const docRef = await getBoardsData()

  //   if (docRef == null) {
  //     return
  //   }

  //   const otherBoards = boards.value.filter(
  //     (board) => board !== currentBoard.value
  //   )

  //   await updateDoc(docRef, {
  //     boards: [
  //       ...otherBoards,
  //       {
  //         name: board.name,
  //         columns: board.columns
  //       }
  //     ]
  //   })

  //   showPopup()
  // }

  return {
    boards,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    // getBoardsData,
    // addNewBoard,
    // editBoard,
    isConfirmationPopupShown
  }
})

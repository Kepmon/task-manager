import type { Board } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { boardsColRef } from '../firebase'
import { query, where, addDoc, onSnapshot } from 'firebase/firestore'

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

  const getBoardsData = async (userID: Board['userID']) => {
    if (userID) {
      const userBoardsColRef = query(
        boardsColRef,
        where('userID', '==', userID)
      )

      onSnapshot(userBoardsColRef, async (snapshot) => {
        boards.value = snapshot.docs.map((doc) => doc.data())

        const savedBoard = JSON.parse(
          localStorage.getItem('currentBoard') || '{}'
        )
        if (savedBoard) {
          currentBoard.value = savedBoard
          return
        }
        currentBoard.value = boards.value[0]
      })
    }
  }

  const addNewBoard = async (board: Board) => {
    await addDoc(boardsColRef, board)

    showPopup()
  }

  return {
    boards,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    getBoardsData,
    addNewBoard,
    isConfirmationPopupShown
  }
})

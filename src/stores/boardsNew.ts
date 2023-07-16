import type { Board } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { boardsColRef } from '../firebase'
import {
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Query,
  DocumentData
} from 'firebase/firestore'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const boards = ref<Board[]>([])

  const chosenBoard = ref<Board | null>(null)
  const currentBoard = computed(() => {
    if (boards.value.length === 0) return null

    if (chosenBoard.value) return chosenBoard.value

    return boards.value[0]
  })

  const boardColumns = computed(() =>
    currentBoard.value ? currentBoard.value.columns : null
  )
  const boardColumnsNames = computed(() =>
    boardColumns.value?.map((column) => column.name)
  )
  const isLoading = ref(true)
  const isConfirmationPopupShown = ref(false)

  const showPopup = () => {
    isConfirmationPopupShown.value = true
    setTimeout(() => {
      isConfirmationPopupShown.value = false
    }, 2000)
  }

  const userBoardsColRef = ref<Query<DocumentData> | null>(null)
  const getBoardsData = async (userID: Board['userID']) => {
    if (userID) {
      userBoardsColRef.value = query(
        boardsColRef,
        where('userID', '==', userID),
        orderBy('createdAt', 'desc')
      )

      onSnapshot(userBoardsColRef.value, async (snapshot) => {
        boards.value = snapshot.docs.map((doc) => {
          return {
            docID: doc.id,
            ...(doc.data() as Omit<Board, 'docID'>)
          }
        })

        const savedBoard = JSON.parse(
          localStorage.getItem('currentBoard') || '{}'
        )
        if (savedBoard) {
          chosenBoard.value = savedBoard
        }
      })
    }

    isLoading.value = false
  }

  const addNewBoard = async (board: Omit<Board, 'docID' | 'createdAt'>) => {
    await addDoc(boardsColRef, {
      createdAt: serverTimestamp(),
      ...board
    })
    showPopup()
  }

  const editBoard = async (board: Pick<Board, 'name' | 'columns'>) => {
    if (!userBoardsColRef.value) return

    const currentBoardID = currentBoard.value?.docID as Board['docID']
    const docToEditRef = doc(boardsColRef, currentBoardID)

    if (docToEditRef) {
      await updateDoc(docToEditRef, board)
    }

    chosenBoard.value = boards.value.find(
      (board) => board.docID === currentBoard.value?.docID
    ) as Board
    localStorage.setItem('currentBoard', JSON.stringify(chosenBoard.value))

    showPopup()
  }

  return {
    boards,
    chosenBoard,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    isLoading,
    isConfirmationPopupShown,
    getBoardsData,
    addNewBoard,
    editBoard
  }
})

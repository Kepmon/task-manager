import type { Board, BoardColumn } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onSnapshot,
  query,
  orderBy,
  collection,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

export const useBoardsStore = defineStore('boards', () => {
  const boards = ref<Board[]>([])
  const chosenBoard = ref<null | Board>(null)
  const currentBoard = computed<null | Board>(() => {
    const savedBoard = JSON.parse(localStorage.getItem('currentBoard') || '{}')
    if (chosenBoard.value) return chosenBoard.value

    if (Object.keys(savedBoard).length !== 0) return savedBoard

    if (boards.value.length === 0) return null

    return boards.value[0]
  })
  const boardColumns = ref<BoardColumn[]>([])
  const boardColumnsNames = computed(() =>
    boardColumns.value ? boardColumns.value?.map((column) => column.name) : null
  )

  const activeUser = JSON.parse(localStorage.getItem('user') || '{}')
  const userID = computed(() => {
    if (Object.keys(activeUser).length !== 0) {
      return activeUser.uid
    }

    return null
  })
  const currentBoardID = ref(currentBoard.value?.boardID || null)

  const boardsColRef = collection(db, `users/${userID.value}/boards`)
  const boardsColRefOrdered = query(boardsColRef, orderBy('createdAt', 'desc'))
  onSnapshot(boardsColRefOrdered, (snapshot) => {
    boards.value = snapshot.docs.map((snap) => ({
      ...(snap.data() as Omit<Board, 'boardID'>),
      boardID: snap.id
    }))
  })

  const columnsColRef = collection(
    db,
    `users/${userID.value}/boards/${currentBoardID.value}/columns`
  )
  onSnapshot(columnsColRef, (snapshot) => {
    boardColumns.value = snapshot.docs.map((snap) => ({
      ...(snap.data() as Omit<BoardColumn, 'columnID'>),
      columnID: snap.id
    }))
  })

  const addNewBoard = async (
    boardName: Board['name'],
    boardColumns: string[]
  ) => {
    const addedDocRef = await addDoc(boardsColRef, {
      createdAt: serverTimestamp(),
      name: boardName
    })

    if (addedDocRef) {
      const columnsColRef = collection(db, `${addedDocRef.path}/columns`)

      boardColumns.forEach(async (column) => {
        await addDoc(columnsColRef, {
          name: column,
          createdAt: serverTimestamp()
        })
      })
    }

    chosenBoard.value = boards.value[0]
    localStorage.setItem('currentBoard', JSON.stringify(chosenBoard.value))
  }

  const deleteBoard = async () => {
    const docToEditRef = doc(
      boardsColRef,
      currentBoardID.value as Board['boardID']
    )
    await deleteDoc(docToEditRef)

    if (boards.value.length) {
      chosenBoard.value = boards.value[0]
      localStorage.setItem('currentBoard', JSON.stringify(chosenBoard.value))
    }
  }

  return {
    boards,
    chosenBoard,
    currentBoard,
    currentBoardID,
    boardColumns,
    boardColumnsNames,
    addNewBoard,
    deleteBoard
  }
})

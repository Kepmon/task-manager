import type { Board, BoardColumn } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onSnapshot,
  query,
  orderBy,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useUserStore } from './user'

export const useBoardsStore = defineStore('boards', () => {
  const userStore = useUserStore()

  const boards = ref<Board[]>([])
  const chosenBoard = ref<null | Board>(null)
  const currentBoard = computed<null | Board>(() => {
    const savedBoard = JSON.parse(localStorage.getItem('currentBoard') || '{}')
    if (chosenBoard.value) return chosenBoard.value

    if (Object.keys(savedBoard).length !== 0) return savedBoard

    if (boards.value.length === 0) return null

    return boards.value[0]
  })
  const currentBoardID = ref(currentBoard.value?.boardID || null)

  const boardColumns = ref<BoardColumn[]>([])
  const boardColumnsNames = computed(() =>
    boardColumns.value?.map((column) => column.name)
  )

  const boardsColRef = collection(db, `users/${userStore.userID}/boards`)
  const boardsColRefOrdered = query(boardsColRef, orderBy('createdAt', 'desc'))
  const removeBoardsSnapshot = onSnapshot(boardsColRefOrdered, (snapshot) => {
    boards.value = snapshot.docs.map((snap) => ({
      ...(snap.data() as Omit<Board, 'boardID'>),
      boardID: snap.id
    }))
  })

  const columnsColRef = collection(
    db,
    `users/${userStore.userID}/boards/${currentBoardID.value}/columns`
  )
  const columnsColRefOrdered = query(columnsColRef, orderBy('createdAt', 'asc'))
  const removeColumnsSnapshot = onSnapshot(columnsColRefOrdered, (snapshot) => {
    boardColumns.value = snapshot.docs.map((snap) => ({
      ...(snap.data() as Omit<BoardColumn, 'columnID'>),
      columnID: snap.id
    }))
  })

  const getColumnIDs = async () => {
    const columnDocs = (await getDocs(columnsColRef)).docs
    return {
      columnIDs: columnDocs.map((columnDoc) => columnDoc.id),
      columnsColRefPath: columnsColRef.path
    }
  }

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

  const editBoard = async (
    boardName: Board['name'],
    boardColumns: string[]
  ) => {
    const docToEditRef = doc(boardsColRef, currentBoardID.value as string)

    if (boardName !== (currentBoard.value as Board).name) {
      await updateDoc(docToEditRef, {
        name: boardName
      })
    }

    const columnsColRef = collection(db, `${docToEditRef.path}/columns`)
    const columnDocsRefs = (await getDocs(columnsColRef)).docs
    const columnDocsNames = columnDocsRefs.map(
      (columnDoc) => columnDoc.data().name
    )
    columnDocsNames.forEach(async (columnDocName, index) => {
      if (boardColumns[index] === columnDocName) return

      if (boardColumns[index] == null) {
        const columnDocRef = doc(columnsColRef, columnDocsRefs[index].id)

        const tasksColRefs = collection(db, `${columnDocRef.path}/tasks`)
        const tasksDocRefs = await getDocs(tasksColRefs)
        tasksDocRefs.forEach(async (tasksDocRef) => {
          const subtasksColRef = collection(
            db,
            `${tasksColRefs.path}/${tasksDocRef.id}/subtasks`
          )

          const subtasksDocRefs = await getDocs(subtasksColRef)
          subtasksDocRefs.forEach(async (subtasksDocRef) => {
            await deleteDoc(subtasksDocRef.ref)
          })

          await deleteDoc(tasksDocRef.ref)
        })

        await deleteDoc(columnDocRef)
        return
      }

      const docToEditRef = doc(columnsColRef, columnDocsRefs[index].id)
      updateDoc(docToEditRef, {
        name: boardColumns[index]
      })
    })

    if (boardColumns.length > columnDocsNames.length) {
      boardColumns.forEach(async (boardColumn, index) => {
        if (columnDocsNames[index] != null) return

        await addDoc(columnsColRef, {
          name: boardColumn,
          createdAt: serverTimestamp()
        })
      })
    }

    chosenBoard.value =
      boards.value.find(
        (board) => board.boardID === (currentBoard.value as Board).boardID
      ) || null
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
    removeBoardsSnapshot,
    removeColumnsSnapshot,
    getColumnIDs,
    addNewBoard,
    editBoard,
    deleteBoard
  }
})

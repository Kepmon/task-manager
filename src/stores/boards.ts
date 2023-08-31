import type { Board, BoardColumn } from '../api/boardsTypes'
import type {
  CollectionReference,
  DocumentReference,
  DocumentData
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
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
import { useTasksStore } from './tasks'

export const useBoardsStore = defineStore('boards', () => {
  const userStore = useUserStore()
  const tasksStore = useTasksStore()

  const boards = ref<Board[]>([])
  const currentBoard = ref<null | Board>(null)
  const currentBoardID = computed(() => currentBoard.value?.boardID || null)

  const boardColumns = ref<BoardColumn[]>([])
  const boardColumnsNames = computed(() =>
    boardColumns.value ? boardColumns.value.map((column) => column.name) : null
  )

  const boardsColRefGlobal = ref<null | CollectionReference<DocumentData>>(null)

  const getBoards = async () => {
    const boardsColRef = collection(db, `users/${userStore.userID}/boards`)
    boardsColRefGlobal.value = boardsColRef

    const boardsColRefOrdered = query(
      boardsColRef,
      orderBy('createdAt', 'desc')
    )

    const boardDocs = await getDocs(boardsColRefOrdered)

    if (boardDocs.docs.length !== 0) {
      boards.value = boardDocs.docs.map((snap) => ({
        ...(snap.data() as Omit<Board, 'boardID'>),
        boardID: snap.id
      }))
    }

    if (boardDocs.docs.length === 0) {
      boards.value = []
    }
  }

  const getColumns = async () => {
    if (boardsColRefGlobal.value != null) {
      const columnsColRef = collection(
        db,
        `${boardsColRefGlobal.value.path}/${currentBoardID.value}/columns`
      )

      const columnsColRefOrdered = query(
        columnsColRef,
        orderBy('createdAt', 'asc')
      )

      const columnDocs = (await getDocs(columnsColRefOrdered)).docs
      boardColumns.value =
        columnDocs.length !== 0
          ? await Promise.all(
              columnDocs.map(async (columnDoc) => {
                return {
                  ...(columnDoc.data() as Omit<BoardColumn, 'columnID'>),
                  columnID: columnDoc.id
                }
              })
            )
          : []

      await tasksStore.getTasks(columnsColRef, boardColumns.value)
    }
  }

  const addDocToFirestore = async (
    colRef: CollectionReference<DocumentData>,
    name: string
  ) => {
    return await addDoc(colRef, {
      createdAt: serverTimestamp(),
      name
    })
  }

  const updateFirestoreDoc = async (
    docRef: DocumentReference<DocumentData>,
    name: string
  ) => {
    return await updateDoc(docRef, {
      name
    })
  }

  const addNewBoard = async (
    boardName: Board['name'],
    boardColumns: string[]
  ) => {
    const addedDocRef = await addDocToFirestore(
      boardsColRefGlobal.value as CollectionReference<DocumentData>,
      boardName
    )

    if (addedDocRef) {
      const columnsColRef = collection(db, `${addedDocRef.path}/columns`)

      boardColumns.forEach(async (column) => {
        await addDocToFirestore(columnsColRef, column)
      })
    }

    await getBoards()

    currentBoard.value = boards.value[0]
    localStorage.setItem(
      `currentBoard-${userStore.userID}`,
      JSON.stringify(currentBoard.value)
    )
    await getColumns()
  }

  const editBoard = async (
    boardName: Board['name'],
    boardColumns: string[]
  ) => {
    const isBoardNameSame = boardName === (currentBoard.value as Board).name
    const areColumnNamesSame =
      boardColumnsNames.value != null &&
      boardColumnsNames.value.length === boardColumns.length &&
      boardColumnsNames.value.every(
        (column, index) => column === boardColumns[index]
      )

    if (isBoardNameSame && areColumnNamesSame) return

    const docToEditRef = doc(
      boardsColRefGlobal.value as CollectionReference<DocumentData>,
      currentBoardID.value as string
    )
    const lastCurrentBoardID = (currentBoard.value as Board).boardID

    if (boardName !== (currentBoard.value as Board).name) {
      await updateFirestoreDoc(docToEditRef, boardName)

      if (areColumnNamesSame) {
        await getBoards()

        currentBoard.value =
          boards.value.find((board) => board.boardID === lastCurrentBoardID) ||
          boards.value[0]
        localStorage.setItem(
          `currentBoard-${userStore.userID}`,
          JSON.stringify(currentBoard.value)
        )
        await getColumns()
        return
      }
    }

    const columnsColRef = collection(db, `${docToEditRef.path}/columns`)
    if (
      boardColumnsNames.value &&
      boardColumns.length > boardColumnsNames.value.length
    ) {
      boardColumns.forEach(async (boardColumn, index) => {
        if ((boardColumnsNames.value as BoardColumn['name'][])[index] != null)
          return

        await addDocToFirestore(columnsColRef, boardColumn)
      })
    }

    const columnDocsRefs = (await getDocs(columnsColRef)).docs

    if (boardColumnsNames.value != null) {
      boardColumnsNames.value.forEach(async (columnDocName, index) => {
        if (boardColumns[index] === columnDocName) return

        if (boardColumns[index] == null) {
          await deleteColumn(columnDocsRefs[index].id)
          return
        }

        const docToEditRef = doc(columnsColRef, columnDocsRefs[index].id)
        await updateFirestoreDoc(docToEditRef, boardColumns[index])
      })
    }

    await getBoards()

    currentBoard.value =
      boards.value.find((board) => board.boardID === lastCurrentBoardID) ||
      boards.value[0]
    localStorage.setItem(
      `currentBoard-${userStore.userID}`,
      JSON.stringify(currentBoard.value)
    )
    await getColumns()
  }

  const deleteBoard = async (boardID: Board['boardID']) => {
    const boardDocRef = doc(
      boardsColRefGlobal.value as CollectionReference<DocumentData>,
      boardID
    )
    const columnsColRefs = collection(db, `${boardDocRef.path}/columns`)
    const columnsDocRefs = (await getDocs(columnsColRefs)).docs

    columnsDocRefs.forEach(async (columnDocRef) => {
      await deleteColumn(columnDocRef.id)
    })

    await deleteDoc(boardDocRef)
    await getBoards()

    if (boards.value.length === 0) {
      currentBoard.value = null
      localStorage.removeItem(`currentBoard-${userStore.userID}`)
      await getBoards()
      await getColumns()
      return
    }

    currentBoard.value = boards.value[0]
    localStorage.setItem(
      `currentBoard-${userStore.userID}`,
      JSON.stringify(currentBoard.value)
    )
    await getColumns()
  }

  const deleteColumn = async (columnID: BoardColumn['columnID']) => {
    const columnsColRef = collection(
      db,
      `${
        (boardsColRefGlobal.value as CollectionReference<DocumentData>).path
      }/${currentBoardID.value}/columns`
    )
    const columnDocRef = doc(columnsColRef, columnID)

    const tasksColRefs = collection(db, `${columnDocRef.path}/tasks`)
    const tasksDocRefs = await getDocs(tasksColRefs)
    if (tasksDocRefs.docs.length !== 0) {
      tasksDocRefs.forEach(async (tasksDocRef) => {
        const subtasksColRef = collection(
          db,
          `${tasksColRefs.path}/${tasksDocRef.id}/subtasks`
        )

        const subtasksDocRefs = await getDocs(subtasksColRef)
        if (subtasksDocRefs.docs.length !== 0) {
          subtasksDocRefs.forEach(async (subtasksDocRef) => {
            await deleteDoc(subtasksDocRef.ref)
          })
        }

        await deleteDoc(tasksDocRef.ref)
      })
    }

    await deleteDoc(columnDocRef)
    await getColumns()
  }

  return {
    boards,
    currentBoard,
    currentBoardID,
    boardColumns,
    boardColumnsNames,
    getBoards,
    getColumns,
    addNewBoard,
    editBoard,
    deleteBoard,
    deleteColumn
  }
})

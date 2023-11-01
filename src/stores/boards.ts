import type { Board, BoardColumn, FormSubsetItem } from '../api/boardsTypes'
import type {
  CollectionReference,
  DocumentReference,
  DocumentData,
  FirestoreError
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  query,
  orderBy,
  collection,
  doc,
  getDoc,
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

  const boardsColRefGlobal = ref<null | CollectionReference<DocumentData>>(null)

  const getBoards = async () => {
    const boardsColRef = collection(db, `users/${userStore.userID}/boards`)
    boardsColRefGlobal.value = boardsColRef

    const boardsColRefOrdered = query(
      boardsColRef,
      orderBy('createdAt', 'desc')
    )

    try {
      const boardDocs = await getDocs(boardsColRefOrdered)

      if (boardDocs == null) throw new Error()

      if (boardDocs.docs.length !== 0) {
        boards.value = boardDocs.docs.map((snap) => ({
          ...(snap.data() as Omit<Board, 'boardID'>),
          boardID: snap.id
        }))
      }

      if (boardDocs.docs.length === 0) {
        boards.value = []
      }

      return true
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const returnColumnsColRef = () => {
    const columnsColRef = collection(
      db,
      `${boardsColRefGlobal.value?.path}/${currentBoardID.value}/columns`
    )

    const columnsColRefOrdered = query(
      columnsColRef,
      orderBy('createdAt', 'asc')
    )

    return { columnsColRef, columnsColRefOrdered }
  }

  const getColumns = async () => {
    if (boardsColRefGlobal.value != null) {
      const columnRefs = returnColumnsColRef()

      try {
        const columnDocs =
          columnRefs.columnsColRefOrdered != null
            ? (await getDocs(columnRefs.columnsColRefOrdered)).docs
            : (await getDocs(columnRefs.columnsColRef)).docs

        if (columnDocs == null) throw new Error()

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

        if (columnDocs.length !== 0) {
          const response = await tasksStore.getTasks(
            columnRefs.columnsColRef,
            boardColumns.value
          )

          if (response !== true) throw new Error('wrong response')
        }
        return true
      } catch (err) {
        return (err as FirestoreError).code
      }
    }
    return 'wrong response'
  }

  const saveCurrentBoard = async (newBoard: Board) => {
    currentBoard.value = newBoard
    localStorage.setItem(
      `TM-currentBoard-${userStore.userID}`,
      JSON.stringify(currentBoard.value)
    )
    const response = await getColumns()

    if (response !== true) return response

    return true
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
    const nameBefore = name
    await updateDoc(docRef, {
      name
    })
    const nameAfter = ((await getDoc(docRef)).data() as Board).name

    if (nameBefore !== nameAfter) return 'wrong response'

    return true
  }

  const addNewBoard = async (
    boardName: Board['name'],
    boardColumns: string[]
  ) => {
    try {
      const addedDocRef = await addDocToFirestore(
        boardsColRefGlobal.value as CollectionReference<DocumentData>,
        boardName
      )

      if (addedDocRef == null) throw new Error('custom error')

      if (addedDocRef) {
        const columnsColRef = collection(db, `${addedDocRef.path}/columns`)

        boardColumns.forEach(async (column) => {
          await addDocToFirestore(columnsColRef, column)
        })
      }

      const boardsResponse = await getBoards()

      if (boardsResponse === true) {
        try {
          const saveBoardResponse = await saveCurrentBoard(boards.value[0])

          if (saveBoardResponse !== true) throw new Error(saveBoardResponse)
        } catch (err) {
          return (err as FirestoreError).code
        }
      }

      return true
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const editBoard = async (
    boardName: Board['name'],
    updatedColumns: FormSubsetItem[]
  ) => {
    const isBoardNameSame = boardName === (currentBoard.value as Board).name
    const isNumberOfColumnsSame =
      boardColumns.value?.length === updatedColumns.length
    const areColumnsNamesSame = (boardColumns.value as BoardColumn[]).every(
      ({ columnID, name: columnName }) =>
        updatedColumns.find(
          ({ name, id }) => columnName === name && columnID === id
        )
    )

    const isFormNotChanged = [
      isBoardNameSame,
      isNumberOfColumnsSame,
      areColumnsNamesSame
    ].every((item) => item === true)

    if (isFormNotChanged) return true

    const docToEditRef = doc(
      boardsColRefGlobal.value as CollectionReference<DocumentData>,
      currentBoardID.value as string
    )
    const lastCurrentBoardID = currentBoardID.value

    if (!isBoardNameSame) {
      try {
        const response = await updateFirestoreDoc(docToEditRef, boardName)

        if (response !== true) throw new Error()

        if (areColumnsNamesSame) {
          try {
            const response = await getBoards()

            if (response !== true) throw new Error(response)
          } catch (err) {
            return (err as FirestoreError).code
          }

          const newBoard =
            boards.value.find(
              (board) => board.boardID === lastCurrentBoardID
            ) || boards.value[0]

          try {
            const saveBoardResponse = await saveCurrentBoard(newBoard)

            if (saveBoardResponse !== true) throw new Error(saveBoardResponse)
          } catch (err) {
            return (err as FirestoreError).code
          }
          return true
        }
      } catch (err) {
        return (err as FirestoreError).code || 'wrong response'
      }
    }

    const columnsColRef = collection(db, `${docToEditRef.path}/columns`)
    const noRespectiveColumns = updatedColumns.filter(({ name, id }) => {
      if (
        boardColumns.value != null &&
        (boardColumns.value as BoardColumn[]).some(
          ({ columnID }) => columnID === id
        )
      )
        return

      return name
    })
    if (noRespectiveColumns) {
      noRespectiveColumns.forEach(async ({ name }) => {
        try {
          const response = await addDocToFirestore(columnsColRef, name)

          if (response == null) throw new Error()
        } catch (err) {
          return (err as FirestoreError).code
        }
      })
    }

    if (boardColumns.value != null) {
      boardColumns.value.forEach(async ({ columnID, name }) => {
        const columnDocRef = doc(columnsColRef, columnID)

        const respectiveColumn = updatedColumns.find(
          ({ id }) => id === columnID
        )
        const isColumnNameSame = respectiveColumn?.name === name

        if (respectiveColumn && isColumnNameSame) return

        if (respectiveColumn == null) {
          try {
            await deleteDoc(columnDocRef)
          } catch (err) {
            return (err as FirestoreError).code
          }
          return
        }

        try {
          await updateFirestoreDoc(columnDocRef, respectiveColumn.name)
        } catch (err) {
          return (err as FirestoreError).code
        }
      })
    }

    const newBoard =
      boards.value.find((board) => board.boardID === lastCurrentBoardID) ||
      boards.value[0]

    try {
      const saveBoardResponse = await saveCurrentBoard(newBoard)
      const boardsResponse = await getBoards()

      if (saveBoardResponse !== true) throw new Error(saveBoardResponse)
      if (boardsResponse !== true) throw new Error(boardsResponse)
    } catch (err) {
      return (err as FirestoreError).code
    }

    return true
  }

  const deleteBoard = async (boardID: Board['boardID']) => {
    const boardDocRef = doc(
      boardsColRefGlobal.value as CollectionReference<DocumentData>,
      boardID
    )
    const columnsColRefs = collection(db, `${boardDocRef.path}/columns`)
    const columnsDocRefs = (await getDocs(columnsColRefs)).docs

    const columnResponses = await Promise.all(
      columnsDocRefs.map(async (columnDocRef) => {
        try {
          const response = await deleteColumn(columnDocRef.id, true)

          if (response !== true) throw new Error(response)

          return true
        } catch (err) {
          return (err as FirestoreError).code
        }
      })
    )

    if (columnResponses.some((response) => response !== true))
      return 'wrong response'

    try {
      await deleteDoc(boardDocRef)
      const boardsResponse = await getBoards()

      if (boardsResponse !== true) throw new Error(boardsResponse)

      if (boards.value.length === 0) {
        currentBoard.value = null
        localStorage.removeItem(`TM-currentBoard-${userStore.userID}`)
      }

      if (boards.value.length > 0) {
        try {
          const saveBoardResponse = await saveCurrentBoard(boards.value[0])
          const columnsResponse = await getColumns()

          if (saveBoardResponse !== true) throw new Error(saveBoardResponse)
          if (columnsResponse !== true) throw new Error(columnsResponse)
        } catch (err) {
          return (err as FirestoreError).code
        }
      }

      return true
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const deleteColumn = async (
    columnID: BoardColumn['columnID'],
    omitFetch?: true
  ) => {
    const columnsColRef = collection(
      db,
      `${
        (boardsColRefGlobal.value as CollectionReference<DocumentData>).path
      }/${currentBoardID.value}/columns`
    )
    const columnDocRef = doc(columnsColRef, columnID)

    const tasksColRefs = collection(db, `${columnDocRef.path}/tasks`)

    try {
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

      if (omitFetch != null) {
        try {
          const response = await getColumns()

          if (response !== true) throw new Error(response)
        } catch (err) {
          return (err as FirestoreError).code
        }
      }

      return true
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  return {
    boards,
    currentBoard,
    boardColumns,
    getBoards,
    getColumns,
    saveCurrentBoard,
    addNewBoard,
    editBoard,
    deleteBoard,
    deleteColumn
  }
})

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
    if (
      currentBoard.value != null &&
      currentBoard.value.boardID === newBoard.boardID
    )
      return true

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
    name: string,
    dotColor?: string
  ) => {
    return dotColor != null
      ? await addDoc(colRef, {
          createdAt: serverTimestamp(),
          name,
          dotColor
        })
      : await addDoc(colRef, {
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

  const updateColumns = (
    updatedColumn: BoardColumn,
    action: 'add' | 'delete'
  ) => {
    const actionHandlers = {
      add: () => {
        tasksStore.subtasks = [...tasksStore.subtasks, []]
        tasksStore.tasks = [...tasksStore.tasks, []]
        boardColumns.value = [...boardColumns.value, updatedColumn]
      },
      delete: () => {
        const indexOfDeletedColumn = boardColumns.value.indexOf(updatedColumn)

        tasksStore.subtasks = tasksStore.subtasks.filter(
          (_, index) => index !== indexOfDeletedColumn
        )
        tasksStore.tasks = tasksStore.tasks.filter(
          (_, index) => index !== indexOfDeletedColumn
        )
        boardColumns.value = boardColumns.value.filter(
          ({ columnID }) => columnID !== updatedColumn.columnID
        )
      }
    }

    actionHandlers[action]()
  }

  const addNewColumn = async (name: string, dotColor: string) => {
    const { columnsColRef } = returnColumnsColRef()

    try {
      const addedDocRef = await addDoc(columnsColRef, {
        dotColor,
        name,
        createdAt: serverTimestamp()
      })

      if (addedDocRef == null) throw new Error()

      const newColumn = {
        ...((await getDoc(addedDocRef)).data() as BoardColumn),
        columnID: addedDocRef.id
      }
      updateColumns(newColumn, 'add')

      return true
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const addNewBoard = async (
    boardName: Board['name'],
    newBoardColumns: string[],
    dotColors: string[]
  ) => {
    try {
      const addedDocRef = await addDocToFirestore(
        boardsColRefGlobal.value as CollectionReference<DocumentData>,
        boardName
      )

      if (addedDocRef == null) throw new Error('custom error')

      boards.value = [
        {
          name: boardName,
          boardID: addedDocRef.id
        },
        ...boards.value
      ]

      const columnsColRef = collection(db, `${addedDocRef.path}/columns`)

      const responses = await Promise.all(
        newBoardColumns.map(async (column, index) => {
          return await addDocToFirestore(
            columnsColRef,
            column,
            dotColors[index]
          )
        })
      )
      if (responses.every((response) => response != null)) {
        const newColumns = responses.map(({ id }, index) => ({
          name: newBoardColumns[index],
          columnID: id,
          dotColor: dotColors[index]
        }))
        boardColumns.value = [...newColumns]

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
    updatedColumns: FormSubsetItem[],
    dotColors: string[]
  ) => {
    const isBoardNameSame = boardName === (currentBoard.value as Board).name
    const isNumberOfColumnsSame =
      boardColumns.value?.length === updatedColumns.length
    const areColumnsNamesAndDotsSame = (
      boardColumns.value as BoardColumn[]
    ).every(({ columnID, name: columnName, dotColor }) =>
      updatedColumns.find(
        ({ name, id }, index) =>
          columnName === name &&
          columnID === id &&
          dotColor === dotColors[index]
      )
    )

    const isFormNotChanged = [
      isBoardNameSame,
      isNumberOfColumnsSame,
      areColumnsNamesAndDotsSame
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

        if (areColumnsNamesAndDotsSame) {
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
    const noRespectiveColumns = updatedColumns.map(({ name, id }, index) => {
      if (
        boardColumns.value != null &&
        boardColumns.value.some(({ columnID }) => columnID === id)
      )
        return null

      return { name, dotColor: dotColors[index] }
    })
    const columnsToBeAdded = noRespectiveColumns.filter(
      (column) => column != null
    )
    if (columnsToBeAdded.length > 0) {
      ;(columnsToBeAdded as { name: string; dotColor: string }[]).forEach(
        async ({ name, dotColor }) => {
          try {
            const response = await addDocToFirestore(
              columnsColRef,
              name,
              dotColor
            )

            if (response == null) throw new Error()
          } catch (err) {
            return (err as FirestoreError).code
          }
        }
      )
    }

    if (boardColumns.value != null) {
      boardColumns.value.forEach(async ({ columnID, name, dotColor }) => {
        const columnDocRef = doc(columnsColRef, columnID)

        const respectiveColumn = updatedColumns.find(
          ({ id }) => id === columnID
        )
        const indexOfRespectiveColumn =
          respectiveColumn != null
            ? updatedColumns.indexOf(respectiveColumn)
            : null
        const isColumnNameSame = respectiveColumn?.name === name
        const isDotColorSame =
          indexOfRespectiveColumn != null
            ? dotColors[indexOfRespectiveColumn] === dotColor
            : false

        if (respectiveColumn && isColumnNameSame && isDotColorSame) return

        if (respectiveColumn == null) {
          try {
            await deleteDoc(columnDocRef)
          } catch (err) {
            return (err as FirestoreError).code
          }
          return
        }

        if (!isColumnNameSame) {
          try {
            await updateFirestoreDoc(columnDocRef, respectiveColumn.name)
          } catch (err) {
            return (err as FirestoreError).code
          }
        }

        if (!isDotColorSame) {
          try {
            await updateDoc(columnDocRef, {
              dotColor: dotColors[indexOfRespectiveColumn as number]
            })
          } catch (err) {
            return (err as FirestoreError).code
          }
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
          const response = await deleteColumn(columnDocRef.id)

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

      if (boards.value.length === 1) {
        boards.value = []
        currentBoard.value = null
        localStorage.removeItem(`TM-currentBoard-${userStore.userID}`)
      }

      if (boards.value.length > 1) {
        const idOfDeletedBoard = boardDocRef.id
        boards.value = boards.value.filter(
          ({ boardID }) => boardID !== idOfDeletedBoard
        )

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

  const deleteColumn = async (columnID: BoardColumn['columnID']) => {
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

      const columnToBeDeleted = boardColumns.value.find(
        (column) => column.columnID === columnID
      )
      if (columnToBeDeleted != null) {
        updateColumns(columnToBeDeleted, 'delete')
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
    addNewColumn,
    addNewBoard,
    editBoard,
    deleteBoard,
    deleteColumn
  }
})

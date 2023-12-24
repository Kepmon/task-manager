import type { Board, BoardColumn, Task } from '../api/boardsTypes'
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
  limit,
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
import { useFormsStore } from './forms'

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
    const boardsColRefOrdered = query(
      boardsColRef,
      orderBy('createdAt', 'desc')
    )
    try {
      const boardDocs = await getDocs(boardsColRefOrdered)

      if (boardDocs == null) throw new Error()

      if (boardDocs.docs.length === 0) return [] as Board[]

      return boardDocs.docs.map((boardDoc) => ({
        ...(boardDoc.data() as Omit<Board, 'boardID'>),
        boardID: boardDoc.id
      }))
    } catch (err) {
      return [] as Board[]
    }
  }

  const getFirstBoard = async () => {
    const boardsColRef = collection(db, `users/${userStore.userID}/boards`)
    const boardsColRefOrdered = query(
      boardsColRef,
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    const firstBoardRef = await getDocs(boardsColRefOrdered)
    const firstBoard = {
      ...(firstBoardRef.docs[0].data() as Omit<Board, 'boardID'>),
      boardID: firstBoardRef.docs[0].id
    }

    return firstBoard.boardID
  }

  const getCurrentBoard = async (allBoards: Board[]) => {
    const currentBoard = JSON.parse(
      localStorage.getItem(`TM-currentBoard-${userStore.userID}`) || '{}'
    )
    let currentBoardID: string

    if (Object.keys(currentBoard).length === 0) {
      currentBoardID = await getFirstBoard()
    } else {
      currentBoardID = currentBoard.boardID as Board['boardID']
    }

    return (
      allBoards.find(({ boardID }) => boardID === currentBoardID) || {
        boardID: '',
        name: ''
      }
    )
  }

  const getColumns = async (currentBoard: Board) => {
    const columnsColRef = collection(
      db,
      `users/${userStore.userID}/boards/${currentBoard.boardID}/columns`
    )
    const columnsColRefOrdered = query(
      columnsColRef,
      orderBy('createdAt', 'asc')
    )

    try {
      const columnDocs = await getDocs(columnsColRefOrdered)

      if (columnDocs == null) throw new Error()

      if (columnDocs.docs.length === 0)
        return {
          boardColumns: [] as BoardColumn[],
          columnsColRef
        }

      const boardColumns = columnDocs.docs.map((columnDoc) => ({
        ...(columnDoc.data() as Omit<BoardColumn, 'columnID'>),
        columnID: columnDoc.id
      }))

      return { boardColumns, columnsColRef }
    } catch (err) {
      return {
        boardColumns: [] as BoardColumn[],
        columnsColRef
      }
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

  const saveCurrentBoard = async (newBoard: Board) => {
    const alreadyFetchedBoard = userStore.userData.fullBoards.find(
      ({ boardID }) => boardID === newBoard.boardID
    )

    if (alreadyFetchedBoard == null) {
      try {
        const columnsData = await getColumns(newBoard)
        const tasksData = await tasksStore.getTasks(
          columnsData.columnsColRef,
          columnsData.boardColumns
        )
        const boardSubtasks = await tasksStore.getSubtasks(
          tasksData.map(({ tasksColRef }) => tasksColRef),
          tasksData.map(({ tasks }) => tasks)
        )

        if (
          [columnsData, tasksData, boardSubtasks].some((item) => item == null)
        )
          throw new Error()

        userStore.userData.currentBoard = {
          boardID: newBoard.boardID,
          boardName: newBoard.name,
          boardColumns: columnsData.boardColumns,
          boardTasks: tasksData.map((item) =>
            item.tasks.every((task) => typeof task !== 'string')
          )
            ? tasksData.map((item) => item.tasks)
            : ([[]] as Task[][]),
          boardSubtasks
        }
        userStore.userData.fullBoards = [
          ...userStore.userData.fullBoards,
          userStore.userData.currentBoard
        ]
      } catch (err) {
        return false
      }
    }

    if (alreadyFetchedBoard != null) {
      userStore.userData.currentBoard = alreadyFetchedBoard
    }

    localStorage.setItem(
      `TM-currentBoard-${userStore.userID}`,
      JSON.stringify(userStore.userData.currentBoard)
    )

    const formsStore = useFormsStore()
    formsStore.resetFormData('board', 'edit')
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

        const columnsObj = allColumns.value.find(
          ({ boardID }) => boardID === currentBoardID.value
        )

        if (columnsObj != null) {
          columnsObj.boardColumns = [...columnsObj.boardColumns, updatedColumn]
          const allColumnsFiltered = allColumns.value.filter(
            ({ boardID }) => boardID !== currentBoardID.value
          )
          allColumns.value = [...allColumnsFiltered, columnsObj]
        }
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

        const columnsObj = allColumns.value.find(
          ({ boardID }) => boardID === currentBoardID.value
        )

        if (columnsObj != null) {
          columnsObj.boardColumns = columnsObj.boardColumns.filter(
            ({ columnID }) => columnID !== updatedColumn.columnID
          )
          const allColumnsFiltered = allColumns.value.filter(
            ({ boardID }) => boardID !== currentBoardID.value
          )
          allColumns.value = [...allColumnsFiltered, columnsObj]
        }
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

  const addNewBoard = async (action: 'add' | 'edit') => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.board[action].data

    try {
      const addedDocRef = await addDocToFirestore(
        boardsColRefGlobal.value as CollectionReference<DocumentData>,
        formData.name
      )

      if (addedDocRef == null) throw new Error('custom error')

      boards.value = [
        {
          name: formData.name,
          boardID: addedDocRef.id
        },
        ...boards.value
      ]

      const columnsColRef = collection(db, `${addedDocRef.path}/columns`)

      const responses = await Promise.all(
        formData.items.map(async ({ name, dotColor }) => {
          return await addDocToFirestore(columnsColRef, name, dotColor)
        })
      )

      if (responses.every((response) => response != null)) {
        const newColumns = responses.map(({ id }, index) => ({
          name: formData.items[index].name,
          columnID: id,
          dotColor: formData.items[index].dotColor
        }))
        boardColumns.value = [...newColumns]
        allColumns.value = [...allColumns.value, ...newColumns]

        saveCurrentBoard(boards.value[0])
      }

      return true
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const editBoard = async (action: 'add' | 'edit') => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.board[action].data

    const isBoardNameSame = formData.name === currentBoard.value?.name
    const isNumberOfColumnsSame =
      boardColumns.value?.length === formData.items.length
    const areColumnsNamesAndDotsSame = boardColumns.value.every(
      ({ columnID, name: columnName, dotColor: oldDotColor }) =>
        formData.items.find(
          ({ name, id, dotColor }) =>
            columnName === name && columnID === id && oldDotColor === dotColor
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

    if (!isBoardNameSame) {
      try {
        const response = await updateFirestoreDoc(docToEditRef, formData.name)

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
              ({ boardID }) => boardID === currentBoardID.value
            ) || boards.value[0]
          saveCurrentBoard(newBoard)
        }
      } catch (err) {
        return (err as FirestoreError).code || 'wrong response'
      }
    }

    const columnsColRef = collection(db, `${docToEditRef.path}/columns`)
    const noRespectiveColumns = formData.items.map(({ name, id, dotColor }) => {
      if (
        boardColumns.value != null &&
        boardColumns.value.some(({ columnID }) => columnID === id)
      )
        return null

      return { name, dotColor }
    })
    const columnsToBeAdded = noRespectiveColumns.filter(
      (column) => column != null
    )
    if (columnsToBeAdded.length > 0) {
      columnsToBeAdded.forEach(async (column) => {
        if (column != null) {
          try {
            const response = await addDocToFirestore(
              columnsColRef,
              column.name,
              column.dotColor
            )

            if (response == null) throw new Error()
          } catch (err) {
            return (err as FirestoreError).code
          }
        }
      })
    }

    if (boardColumns.value != null) {
      const errorCodes = await Promise.all(
        boardColumns.value.map(async ({ columnID, name, dotColor }) => {
          const columnDocRef = doc(columnsColRef, columnID)

          const respectiveColumn = formData.items.find(
            ({ id }) => id === columnID
          )

          const isColumnNameSame = respectiveColumn?.name === name
          const isDotColorSame = respectiveColumn?.dotColor === dotColor

          if (respectiveColumn != null && isColumnNameSame && isDotColorSame)
            return

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
                dotColor: respectiveColumn.dotColor
              })
            } catch (err) {
              return (err as FirestoreError).code
            }
          }
        })
      )

      if (errorCodes.some((code) => code != null))
        throw new Error('wrong response')
    }

    const newBoard =
      boards.value.find(({ boardID }) => boardID === currentBoardID.value) ||
      boards.value[0]

    if (newBoard.name !== formData.name) {
      newBoard.name = formData.name
    }

    saveCurrentBoard(newBoard)

    try {
      const boardsResponse = await getBoards()

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

        saveCurrentBoard(boards.value[0])

        try {
          const columnsResponse = await getColumns()

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
    getCurrentBoard,
    getColumns,
    saveCurrentBoard,
    addNewColumn,
    addNewBoard,
    editBoard,
    deleteBoard,
    deleteColumn
  }
})

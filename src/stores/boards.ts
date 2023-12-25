import type { Board, BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type {
  CollectionReference,
  DocumentReference,
  DocumentData
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'
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

  const boardsColRefGlobal = ref<null | CollectionReference<DocumentData>>(null)

  const returnEmptyUserData = () => ({
    allBoards: [],
    fullBoards: [],
    currentBoard: {
      boardID: '',
      boardName: '',
      boardColumns: [] as BoardColumn[],
      columnOfClickedTask: null,
      boardTasks: [[]] as Task[][],
      clickedTask: null,
      boardSubtasks: [[[]]] as Subtask[][][],
      subtasksOfClickedTask: [] as Subtask[]
    }
  })

  const getBoards = async () => {
    const boardsColRef = collection(db, `users/${userStore.userID}/boards`)
    const boardsColRefOrdered = query(
      boardsColRef,
      orderBy('createdAt', 'desc')
    )
    boardsColRefGlobal.value = boardsColRef

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

  const getColumns = async (otherThanCurrentBoard?: Board) => {
    const currentBoard =
      otherThanCurrentBoard || userStore.userData.currentBoard
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
    const currentBoardID = userStore.userData.currentBoard.boardID
    const columnsColRef = collection(
      db,
      `${boardsColRefGlobal.value?.path}/${currentBoardID}/columns`
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
          columnOfClickedTask: null,
          boardTasks: tasksData.map((item) =>
            item.tasks.every((task) => typeof task !== 'string')
          )
            ? tasksData.map((item) => item.tasks)
            : ([[]] as Task[][]),
          clickedTask: null,
          boardSubtasks,
          subtasksOfClickedTask: [] as Subtask[]
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

    if (nameBefore !== nameAfter) return false

    return true
  }

  const updateColumns = (
    updatedColumn: BoardColumn,
    action: 'add' | 'delete'
  ) => {
    const actionHandlers = {
      add: () => {
        userStore.userData.currentBoard.boardSubtasks = [
          ...userStore.userData.currentBoard.boardSubtasks,
          []
        ]
        userStore.userData.currentBoard.boardTasks = [
          ...userStore.userData.currentBoard.boardTasks,
          []
        ]
        userStore.userData.currentBoard.boardColumns = [
          ...userStore.userData.currentBoard.boardColumns,
          updatedColumn
        ]
      },
      delete: () => {
        const indexOfDeletedColumn =
          userStore.userData.currentBoard.boardColumns.indexOf(updatedColumn)

        userStore.userData.currentBoard.boardSubtasks =
          userStore.userData.currentBoard.boardSubtasks.filter(
            (_, index) => index !== indexOfDeletedColumn
          )
        userStore.userData.currentBoard.boardTasks =
          userStore.userData.currentBoard.boardTasks.filter(
            (_, index) => index !== indexOfDeletedColumn
          )
        userStore.userData.currentBoard.boardColumns =
          userStore.userData.currentBoard.boardColumns.filter(
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
      return false
    }
  }

  const addNewBoard = async () => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.board.add.data

    if (boardsColRefGlobal.value == null) return false
    try {
      const addedDocRef = await addDocToFirestore(
        boardsColRefGlobal.value,
        formData.name
      )

      if (addedDocRef == null) throw new Error()

      userStore.userData.allBoards = [
        {
          name: formData.name,
          boardID: addedDocRef.id
        },
        ...userStore.userData.allBoards
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

        userStore.userData.currentBoard.boardColumns = [...newColumns]

        saveCurrentBoard(userStore.userData.allBoards[0])
      }

      return true
    } catch (err) {
      return false
    }
  }

  const editBoard = async () => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.board.edit.data

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

        if (response === false) throw new Error()

        if (areColumnsNamesAndDotsSame) {
          try {
            const boards = await getBoards()

            if (boards.length === 0) throw new Error()
          } catch (err) {
            return false
          }

          const newBoard =
            boards.value.find(
              ({ boardID }) => boardID === currentBoardID.value
            ) || boards.value[0]
          saveCurrentBoard(newBoard)
        }
      } catch (err) {
        return false
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
            return false
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
            return true

          if (respectiveColumn == null) {
            try {
              await deleteDoc(columnDocRef)
            } catch (err) {
              return false
            }
            return true
          }

          if (!isColumnNameSame) {
            try {
              await updateFirestoreDoc(columnDocRef, respectiveColumn.name)
            } catch (err) {
              return false
            }
          }

          if (!isDotColorSame) {
            try {
              await updateDoc(columnDocRef, {
                dotColor: respectiveColumn.dotColor
              })
            } catch (err) {
              return false
            }
          }
        })
      )

      if (errorCodes.some((code) => code != null)) throw new Error()
    }

    const newBoard =
      boards.value.find(({ boardID }) => boardID === currentBoardID.value) ||
      boards.value[0]

    if (newBoard.name !== formData.name) {
      newBoard.name = formData.name
    }

    saveCurrentBoard(newBoard)

    try {
      const boards = await getBoards()

      if (boards.length === 0) throw new Error()
    } catch (err) {
      return false
    }

    return true
  }

  const removeBoardFromLocalStorage = (
    boardDocRef: DocumentReference<DocumentData>
  ) => {
    const allBoards = userStore.userData.allBoards

    if (allBoards.length === 1) {
      userStore.userData.allBoards = [] as Board[]
      userStore.userData.currentBoard = returnEmptyUserData().currentBoard
      localStorage.removeItem(`TM-currentBoard-${userStore.userID}`)
      return
    }

    const idOfDeletedBoard = boardDocRef.id
    userStore.userData.allBoards = allBoards.filter(
      ({ boardID }) => boardID !== idOfDeletedBoard
    )

    saveCurrentBoard(userStore.userData.allBoards[0])
  }

  const deleteColumn = async (columnID: BoardColumn['columnID']) => {
    if (boardsColRefGlobal.value != null) {
      const columnsColRef = collection(
        db,
        `${boardsColRefGlobal.value.path}/${userStore.userData.currentBoard.boardID}/columns`
      )
      const columnDocRef = doc(columnsColRef, columnID)
      const tasksColRefs = collection(db, `${columnDocRef.path}/tasks`)

      try {
        const tasksDocRefs = (await getDocs(tasksColRefs)).docs

        if (tasksDocRefs.length !== 0) {
          tasksDocRefs.forEach(async (tasksDocRef) => {
            const subtasksColRef = collection(
              db,
              `${tasksColRefs.path}/${tasksDocRef.id}/subtasks`
            )

            const subtasksDocRefs = (await getDocs(subtasksColRef)).docs

            if (subtasksDocRefs.length !== 0) {
              subtasksDocRefs.forEach(async (subtasksDocRef) => {
                await deleteDoc(subtasksDocRef.ref)
              })
            }
            await deleteDoc(tasksDocRef.ref)
          })
        }

        await deleteDoc(columnDocRef)

        const columnToBeDeleted =
          userStore.userData.currentBoard.boardColumns.find(
            (column) => column.columnID === columnID
          )
        if (columnToBeDeleted != null) {
          updateColumns(columnToBeDeleted, 'delete')
        }
      } catch (err) {
        return false
      }
    }
  }

  const deleteBoard = async (boardID: Board['boardID']) => {
    if (boardsColRefGlobal.value == null) return false

    const boardDocRef = doc(boardsColRefGlobal.value, boardID)
    const columnsColRefs = collection(db, `${boardDocRef.path}/columns`)
    const columnsDocRefs = (await getDocs(columnsColRefs)).docs

    const columnResponses = await Promise.all(
      columnsDocRefs.map(async (columnDocRef) => {
        try {
          const response = await deleteColumn(columnDocRef.id)

          if (response === false) throw new Error()

          return true
        } catch (err) {
          return false
        }
      })
    )

    if (columnResponses.some((response) => response === false)) return false

    try {
      await deleteDoc(boardDocRef)
    } catch (err) {
      return false
    }

    removeBoardFromLocalStorage(boardDocRef)
  }

  return {
    returnEmptyUserData,
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

import type { Board, BoardColumn, Subtask } from '../api/boardsTypes'
import type {
  CollectionReference,
  DocumentReference,
  DocumentData
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import {
  query,
  orderBy,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useUserStore } from './user'
import { useTasksStore } from './tasks'
import { useFormsStore } from './forms'
import {
  returnEmptyUserData,
  returnPartsOfUserData
} from './helpers/userHelpers'
import { returnColumnsColRef } from './helpers/boardHelpers'
import { nanoid } from 'nanoid'

export const useBoardsStore = defineStore('boards', () => {
  const userStore = useUserStore()
  const tasksStore = useTasksStore()
  const boardsColRefGlobal = computed(() =>
    collection(db, `users/${userStore.userID}/boards`)
  )

  const getBoards = async () => {
    const boardsColRefOrdered = query(
      boardsColRefGlobal.value,
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

  const getColumns = async (otherThanCurrentBoard: Board) => {
    const columnRefs = returnColumnsColRef(otherThanCurrentBoard.boardID)

    try {
      const columnDocs = await getDocs(columnRefs.columnsColRefOrdered)

      if (columnDocs == null) throw new Error()

      if (columnDocs.docs.length === 0) return [] as BoardColumn[]

      return columnDocs.docs.map((columnDoc) => ({
        ...(columnDoc.data() as Omit<BoardColumn, 'columnID'>),
        columnID: columnDoc.id
      }))
    } catch (err) {
      return [] as BoardColumn[]
    }
  }

  const fetchNewBoard = async (newBoard: Board) => {
    try {
      const boardColumns = await getColumns(newBoard)
      const tasks = await tasksStore.getTasks(boardColumns, newBoard)
      const boardSubtasks = await tasksStore.getSubtasks(
        tasks,
        newBoard,
        boardColumns
      )

      if ([boardColumns, tasks, boardSubtasks].some((item) => item == null))
        throw new Error()

      userStore.userData.currentBoard = {
        boardID: newBoard.boardID,
        boardName: newBoard.name,
        boardColumns: boardColumns,
        columnOfClickedTask: null,
        boardTasks: tasks,
        clickedTask: null,
        boardSubtasks,
        subtasksOfClickedTask: [] as Subtask[]
      }
      userStore.userData.fullBoards = [
        ...userStore.userData.fullBoards,
        userStore.userData.currentBoard
      ]

      return true
    } catch (err) {
      return false
    }
  }

  const setFirstBoardAsCurrentOne = (
    boardID: Board['boardID'],
    boardName: Board['name'],
    boardColumns: BoardColumn[]
  ) => {
    const { fullBoards } = returnPartsOfUserData()
    userStore.userData.currentBoard = returnEmptyUserData().currentBoard
    userStore.userData.currentBoard.boardID = boardID
    userStore.userData.currentBoard.boardName = boardName
    userStore.userData.currentBoard.boardColumns = boardColumns

    if (fullBoards.some(({ boardID: id }) => id === boardID)) return

    userStore.userData.fullBoards = [
      userStore.userData.currentBoard,
      ...userStore.userData.fullBoards
    ]
  }

  const addNewBoard = async () => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.board.add.data

    if (boardsColRefGlobal.value == null) return false

    const boardDocID = nanoid()
    const boardDocRef = doc(db, boardsColRefGlobal.value.path, boardDocID)

    try {
      await setDoc(boardDocRef, {
        boardID: boardDocID,
        name: formData.name,
        createdAt: serverTimestamp()
      })

      userStore.userData.allBoards = [
        {
          boardID: boardDocID,
          name: formData.name
        },
        ...userStore.userData.allBoards
      ]

      const response = handleAddedColumns(formData.items, boardDocID)

      if (!response) throw new Error()

      const newColumns = formData.items.map(({ id, name, dotColor }) => ({
        columnID: id,
        name,
        dotColor
      }))

      setFirstBoardAsCurrentOne(boardDocID, formData.name, newColumns)
      userStore.saveUserData(true)

      return true
    } catch (err) {
      return false
    }
  }

  const validateBoardChanges = () => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.board.edit.data
    const currentBoard = userStore.userData.currentBoard
    const boardColumns = userStore.userData.currentBoard.boardColumns

    const isBoardNameSame = formData.name === currentBoard.boardName
    const isNumberOfColumnsSame = boardColumns.length === formData.items.length
    const areColumnsNamesAndDotsSame = boardColumns.every(
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
    ].every((item) => item)

    return {
      isFormNotChanged,
      boardColumns,
      currentBoard,
      formData,
      isBoardNameSame,
      isNumberOfColumnsSame,
      areColumnsNamesAndDotsSame
    }
  }

  const handleBoardNameChanged = async (
    docToEditRef: DocumentReference<DocumentData>,
    validationData: ReturnType<typeof validateBoardChanges>
  ) => {
    try {
      await updateDoc(docToEditRef, {
        name: validationData.formData.name
      })

      return true
    } catch (err) {
      return false
    }
  }

  const handleColumnsEdit = async (
    columnsColRef: CollectionReference<DocumentData>,
    validationData: ReturnType<typeof validateBoardChanges>
  ) => {
    const responses = await Promise.all(
      validationData.boardColumns.map(async ({ columnID, name, dotColor }) => {
        const columnDocRef = doc(columnsColRef, columnID)
        const respectiveColumn = validationData.formData.items.find(
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
        }

        const indexOfRespectiveColumn = validationData.boardColumns.findIndex(
          ({ columnID: id }) => id === columnID
        )

        if (respectiveColumn != null && !isColumnNameSame) {
          try {
            await updateDoc(columnDocRef, {
              name: respectiveColumn.name
            })

            userStore.userData.currentBoard.boardColumns[
              indexOfRespectiveColumn
            ].name = respectiveColumn.name
          } catch (err) {
            return false
          }
        }

        if (respectiveColumn != null && !isDotColorSame) {
          try {
            await updateDoc(columnDocRef, {
              dotColor: respectiveColumn.dotColor
            })

            userStore.userData.currentBoard.boardColumns[
              indexOfRespectiveColumn
            ].dotColor = respectiveColumn.dotColor
          } catch (err) {
            return false
          }
        }

        return true
      })
    )

    if (responses.some((response) => !response)) return false

    return true
  }

  const handleAddedColumns = async (
    columnsToBeAdded: {
      id: string
      name: string
      dotColor: string | undefined
    }[],
    boardID?: Board['boardID']
  ) => {
    const columnsColRef = returnColumnsColRef(boardID).columnsColRef

    const responses = await Promise.all(
      columnsToBeAdded.map(async ({ id, name, dotColor }) => {
        const columnDocRef = doc(columnsColRef, id)
        try {
          await setDoc(columnDocRef, {
            columnID: id,
            name,
            dotColor,
            createdAt: serverTimestamp()
          })

          return true
        } catch (err) {
          return false
        }
      })
    )

    if (responses.some((response) => !response)) return false

    return true
  }

  const handleBoardUIChanges = async (
    validationData: ReturnType<typeof validateBoardChanges>
  ) => {
    const { allBoards, currentBoard } = returnPartsOfUserData()
    const newBoard = allBoards.find(
      ({ boardID }) => boardID === validationData.currentBoard.boardID
    )
    const indexOfNewBoard = allBoards.findIndex(
      ({ boardID }) => boardID === validationData.currentBoard.boardID
    )

    if (
      newBoard != null &&
      indexOfNewBoard != null &&
      newBoard.name !== validationData.formData.name
    ) {
      currentBoard.boardName = validationData.formData.name
      allBoards[indexOfNewBoard].name = validationData.formData.name
    }

    userStore.saveUserData()

    return true
  }

  const editBoard = async () => {
    const validationData = validateBoardChanges()

    if (validationData.isFormNotChanged) return true
    if (boardsColRefGlobal.value == null) return false

    const docToEditRef = doc(
      boardsColRefGlobal.value,
      validationData.currentBoard.boardID
    )

    if (!validationData.isBoardNameSame) {
      const boardNameResponse = handleBoardNameChanged(
        docToEditRef,
        validationData
      )

      if (!boardNameResponse) return false
    }

    const columnsColRef = collection(db, `${docToEditRef.path}/columns`)
    const columnsToBeAdded = validationData.formData.items.filter(
      ({ id }) =>
        !validationData.boardColumns.some(({ columnID }) => columnID === id)
    )

    if (
      columnsToBeAdded.length === 0 &&
      validationData.boardColumns.length === 0
    )
      return true

    const addedColumnsResponse = await handleAddedColumns(columnsToBeAdded)

    if (!addedColumnsResponse) return false

    const columnsEditResponse = await handleColumnsEdit(
      columnsColRef,
      validationData
    )

    if (!columnsEditResponse) return false

    userStore.userData.currentBoard.boardColumns =
      validationData.formData.items.map(({ id, name, dotColor }) => ({
        columnID: id,
        name,
        dotColor
      }))

    const UIChangesResponse = await handleBoardUIChanges(validationData)

    if (!UIChangesResponse) return false

    return true
  }

  const removeBoardFromUserData = async (
    idOfDeletedBoard: Board['boardID']
  ) => {
    const { allBoards, fullBoards } = returnPartsOfUserData()

    userStore.userData.allBoards = allBoards.filter(
      ({ boardID }) => boardID !== idOfDeletedBoard
    )
    userStore.userData.fullBoards = fullBoards.filter(
      ({ boardID }) => boardID !== idOfDeletedBoard
    )
    const newBoard = userStore.userData.fullBoards.find(
      ({ boardID: id }) => id === userStore.userData.allBoards[0].boardID
    )

    if (newBoard != null) {
      userStore.userData.currentBoard = newBoard
    } else {
      await fetchNewBoard(userStore.userData.allBoards[0])
    }
  }

  const deleteColumn = async (
    boardID: Board['boardID'],
    columnID: BoardColumn['columnID']
  ) => {
    if (boardsColRefGlobal.value == null) return false

    const columnRefs = returnColumnsColRef(boardID)
    const columnDocRef = doc(columnRefs.columnsColRef, columnID)
    const tasksColRef = collection(db, `${columnDocRef.path}/tasks`)
    const tasksDocRefs = (await getDocs(tasksColRef)).docs

    if (tasksDocRefs.length > 0) {
      try {
        await Promise.all(
          tasksDocRefs.map(async ({ ref: taskDocRef }) => {
            const subtasksColRef = collection(db, `${taskDocRef.path}/subtasks`)
            const subtasksDocRefs = (await getDocs(subtasksColRef)).docs

            if (subtasksDocRefs.length > 0) {
              await Promise.all(
                subtasksDocRefs.map(async ({ ref: subtaskDocRef }) => {
                  await deleteDoc(subtaskDocRef)
                })
              )
            }

            deleteDoc(taskDocRef)
          })
        )
      } catch (err) {
        return false
      }
    }

    await deleteDoc(columnDocRef)

    userStore.userData.currentBoard.boardColumns =
      userStore.userData.currentBoard.boardColumns.filter(
        ({ columnID: id }) => id !== columnID
      )
    userStore.saveUserData()

    return true
  }

  const deleteBoard = async (boardID: Board['boardID']) => {
    const boardToBeDeleted = userStore.userData.fullBoards.find(
      ({ boardID: id }) => id === boardID
    )

    if (boardsColRefGlobal.value == null || boardToBeDeleted == null)
      return false

    const allColumnsToDelete = boardToBeDeleted.boardColumns

    if (allColumnsToDelete.length > 0) {
      const columnResponses = await Promise.all(
        allColumnsToDelete.map(async ({ columnID }) => {
          const response = await deleteColumn(boardID, columnID)

          if (!response) return false

          return true
        })
      )

      if (columnResponses.some((response) => !response)) return false
    }

    const boardDocRef = doc(boardsColRefGlobal.value, boardID)

    try {
      await deleteDoc(boardDocRef)
      await removeBoardFromUserData(boardID)
    } catch (err) {
      return false
    }

    userStore.saveUserData()

    return true
  }

  return {
    boardsColRefGlobal,
    getBoards,
    fetchNewBoard,
    handleAddedColumns,
    addNewBoard,
    editBoard,
    deleteBoard,
    deleteColumn
  }
})

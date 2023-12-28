import type {
  UserData,
  Board,
  BoardColumn,
  Task,
  Subtask
} from '../api/boardsTypes'
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
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useUserStore } from './user'
import { useTasksStore } from './tasks'
import { useFormsStore } from './forms'
import { nanoid } from 'nanoid'

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

  const returnColumnsColRef = (boardID?: Board['boardID']) => {
    const currentBoardID = boardID || userStore.userData.currentBoard.boardID
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

  const fetchNewBoard = async (newBoard: Board) => {
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

      if ([columnsData, tasksData, boardSubtasks].some((item) => item == null))
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

      return true
    } catch (err) {
      return false
    }
  }

  const saveCurrentBoard = () => {
    localStorage.setItem(
      `TM-currentBoard-${userStore.userID}`,
      JSON.stringify(userStore.userData.currentBoard)
    )

    const formsStore = useFormsStore()
    formsStore.resetFormData('board', 'edit')
  }

  const addDocToFirestore = async (
    docRef: DocumentReference<DocumentData>,
    doc: Board | BoardColumn
  ) => {
    const docToBeAdded = {
      createdAt: serverTimestamp(),
      name: doc.name
    }
    Object.assign(
      docToBeAdded,
      'boardID' in doc
        ? { boardID: doc.boardID }
        : { columnID: doc.columnID, dotColor: doc.dotColor }
    )

    try {
      await setDoc(docRef, docToBeAdded)
      return true
    } catch (err) {
      return false
    }
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

  const setFirstBoardAsCurrentOne = (
    boardID: Board['boardID'],
    boardName: Board['name'],
    boardColumns: BoardColumn[]
  ) => {
    userStore.userData.currentBoard = returnEmptyUserData().currentBoard
    userStore.userData.currentBoard.boardID = boardID
    userStore.userData.currentBoard.boardName = boardName
    userStore.userData.currentBoard.boardColumns = boardColumns
  }

  const addNewBoard = async () => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.board.add.data

    if (boardsColRefGlobal.value == null) return false

    const boardDocID = nanoid()
    const boardDocRef = doc(db, boardsColRefGlobal.value.path, boardDocID)

    try {
      const addDocResponse = await addDocToFirestore(boardDocRef, {
        name: formData.name,
        boardID: boardDocID
      })

      if (!addDocResponse) throw new Error()

      userStore.userData.allBoards = [
        {
          name: formData.name,
          boardID: boardDocID
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
      saveCurrentBoard()

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
      const response = await updateFirestoreDoc(
        docToEditRef,
        validationData.formData.name
      )

      if (response === false) throw new Error()

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
            await updateFirestoreDoc(columnDocRef, respectiveColumn.name)

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
          const response = await addDocToFirestore(columnDocRef, {
            columnID: id,
            name,
            dotColor
          })

          if (response == null) throw new Error()

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
    const newBoard = userStore.userData.allBoards.find(
      ({ boardID }) => boardID === validationData.currentBoard.boardID
    )
    const indexOfNewBoard = userStore.userData.allBoards.findIndex(
      ({ boardID }) => boardID === validationData.currentBoard.boardID
    )

    if (
      newBoard != null &&
      indexOfNewBoard != null &&
      newBoard.name !== validationData.formData.name
    ) {
      userStore.userData.currentBoard.boardName = validationData.formData.name

      userStore.userData.allBoards[indexOfNewBoard].name =
        validationData.formData.name
    }

    saveCurrentBoard()

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

  const removeBoardFromLocalStorage = async (
    boardDocRef: DocumentReference<DocumentData>
  ) => {
    const fullBoards = userStore.userData.fullBoards
    const idOfDeletedBoard = boardDocRef.id

    userStore.userData.allBoards = userStore.userData.allBoards.filter(
      ({ boardID }) => boardID !== idOfDeletedBoard
    )
    const allBoards = userStore.userData.allBoards

    if (fullBoards.length === 1) {
      userStore.userData.fullBoards = [] as UserData['fullBoards']
      const newColumns = (await getColumns(allBoards[0])).boardColumns

      setFirstBoardAsCurrentOne(
        allBoards[0].boardID,
        allBoards[0].name,
        newColumns
      )
    } else {
      userStore.userData.fullBoards = fullBoards.filter(
        ({ boardID }) => boardID !== idOfDeletedBoard
      )
      userStore.userData.currentBoard = userStore.userData.fullBoards[0]
    }
    saveCurrentBoard()

    return true
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

    if (columnResponses.some((response) => !response)) return false

    try {
      await deleteDoc(boardDocRef)
    } catch (err) {
      return false
    }

    const removeBoardResponse = await removeBoardFromLocalStorage(boardDocRef)

    if (!removeBoardResponse) return false

    return true
  }

  return {
    returnEmptyUserData,
    getBoards,
    getCurrentBoard,
    getColumns,
    fetchNewBoard,
    saveCurrentBoard,
    handleAddedColumns,
    addNewBoard,
    editBoard,
    deleteBoard,
    deleteColumn
  }
})

import type { Board, BoardColumn } from '../api/boardsTypes'
import type {
  CollectionReference,
  DocumentReference,
  DocumentData
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
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
import { useTasksStore } from './tasks'

export const useBoardsStore = defineStore('boards', () => {
  const userStore = useUserStore()
  const tasksStore = useTasksStore()

  const isLoading = ref(true)

  const boards = ref<Board[]>([])
  const chosenBoard = ref<null | Board>(null)
  const currentBoard = computed<null | Board>(() => {
    const savedBoard = JSON.parse(localStorage.getItem('currentBoard') || '{}')
    if (chosenBoard.value) return chosenBoard.value

    if (Object.keys(savedBoard).length !== 0) return savedBoard

    if (boards.value.length === 0) return null

    return boards.value[0]
  })
  const currentBoardID = computed(() => currentBoard.value?.boardID || null)
  watch(chosenBoard, async () => {
    await getColumns()
    localStorage.setItem('currentBoard', JSON.stringify(chosenBoard.value))
  })

  const boardColumns = ref<BoardColumn[]>([])
  const boardColumnsNames = computed(() =>
    boardColumns.value ? boardColumns.value.map((column) => column.name) : null
  )

  const boardsColRef = collection(db, `users/${userStore.userID}/boards`)
  const boardsColRefOrdered = query(boardsColRef, orderBy('createdAt', 'desc'))
  const removeBoardsSnapshot = onSnapshot(boardsColRefOrdered, (snapshot) => {
    boards.value = snapshot.docs.map((snap) => ({
      ...(snap.data() as Omit<Board, 'boardID'>),
      boardID: snap.id
    }))
  })

  const getColumns = async () => {
    const columnsColRef = collection(
      db,
      `${boardsColRef.path}/${currentBoardID.value}/columns`
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

    isLoading.value = false
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
    const addedDocRef = await addDocToFirestore(boardsColRef, boardName)

    if (addedDocRef) {
      const columnsColRef = collection(db, `${addedDocRef.path}/columns`)

      boardColumns.forEach(async (column) => {
        await addDocToFirestore(columnsColRef, column)
      })
    }

    chosenBoard.value = boards.value[0]
  }

  const editBoard = async (
    boardName: Board['name'],
    boardColumns: string[]
  ) => {
    const docToEditRef = doc(boardsColRef, currentBoardID.value as string)

    if (boardName !== (currentBoard.value as Board).name) {
      await updateFirestoreDoc(docToEditRef, boardName)
    }

    const columnsColRef = collection(db, `${docToEditRef.path}/columns`)
    const columnDocsRefs = (await getDocs(columnsColRef)).docs
    const columnDocsNames = columnDocsRefs.map(
      (columnDoc) => columnDoc.data().name as BoardColumn['name']
    )

    columnDocsNames.forEach(async (columnDocName, index) => {
      if (boardColumns[index] === columnDocName) return

      if (boardColumns[index] == null) {
        await deleteColumn(columnDocsRefs[index].id)
        return
      }

      const docToEditRef = doc(columnsColRef, columnDocsRefs[index].id)
      await updateFirestoreDoc(docToEditRef, boardColumns[index])
    })

    if (boardColumns.length > columnDocsNames.length) {
      boardColumns.forEach(async (boardColumn, index) => {
        if (columnDocsNames[index] != null) return

        await addDocToFirestore(columnsColRef, boardColumn)
      })
    }

    const chosenBoardBefore = chosenBoard.value
    chosenBoard.value =
      boards.value.find(
        (board) => board.boardID === (currentBoard.value as Board).boardID
      ) || null
    const chosenBoardAfter = chosenBoard.value

    if (chosenBoardBefore === chosenBoardAfter) {
      await getColumns()
    }
  }

  const deleteBoard = async (boardID: Board['boardID']) => {
    const boardDocRef = doc(boardsColRef, boardID)
    const columnsColRefs = collection(db, `${boardDocRef.path}/columns`)
    const columnsDocRefs = (await getDocs(columnsColRefs)).docs

    columnsDocRefs.forEach(async (columnDocRef) => {
      await deleteColumn(columnDocRef.id)
    })

    await deleteDoc(boardDocRef)

    boards.value.length
      ? (chosenBoard.value = boards.value[0])
      : (chosenBoard.value = null)
  }

  const deleteColumn = async (columnID: BoardColumn['columnID']) => {
    const columnsColRef = collection(
      db,
      `${boardsColRef.path}/${currentBoardID.value}/columns`
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
    isLoading,
    boards,
    chosenBoard,
    currentBoard,
    currentBoardID,
    boardColumns,
    boardColumnsNames,
    removeBoardsSnapshot,
    getColumns,
    addNewBoard,
    editBoard,
    deleteBoard,
    deleteColumn
  }
})

import type { Board, BoardColumn } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CollectionReference, DocumentData } from 'firebase/firestore'
import {
  onSnapshot,
  query,
  orderBy,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useUserStore } from './user'

export const useBoardsStore = defineStore('boards', () => {
  const userStore = useUserStore()
  const boardsColRef = ref<null | CollectionReference<DocumentData>>(null)
  const columnsColRef = ref<null | CollectionReference<DocumentData>>(null)
  const boards = ref<Board[]>([])
  const chosenBoard = ref<null | Board>(null)
  const currentBoard = computed<null | Board>(() => {
    const savedBoard = JSON.parse(localStorage.getItem('currentBoard') || '{}')
    if (chosenBoard.value) return chosenBoard.value

    if (Object.keys(savedBoard).length) return savedBoard

    if (boards.value.length === 0) return null

    return boards.value[0]
  })
  const boardColumns = ref<null | BoardColumn[]>(null)
  const boardColumnsNames = computed(() =>
    boardColumns.value ? boardColumns.value?.map((column) => column.name) : null
  )

  const isConfirmationPopupShown = ref(false)
  const action = ref<'add' | 'edit' | 'delete'>('add')

  const getBoardsData = async (userDocID: string) => {
    boardsColRef.value = collection(db, `users/${userDocID}/boards`)
    const boardsColRefOrdered = query(
      boardsColRef.value as CollectionReference<DocumentData>,
      orderBy('createdAt', 'desc')
    )
    onSnapshot(boardsColRefOrdered, (snapshot) => {
      boards.value = snapshot.docs.map((doc) => doc.data() as Board)
    })

    columnsColRef.value = collection(
      db,
      `users/${userStore.userDocID}/boards/${currentBoard.value?.docID}/columns`
    )
    onSnapshot(columnsColRef.value, (snapshot) => {
      boardColumns.value = snapshot.docs.map((doc) => doc.data() as BoardColumn)
      localStorage.setItem('boardColumns', JSON.stringify(boardColumns.value))
    })
  }

  const addNewBoard = async (
    boardName: Board['name'],
    boardColumns: string[]
  ) => {
    const addedDocRef = await addDoc(
      boardsColRef.value as CollectionReference<DocumentData>,
      {
        createdAt: serverTimestamp(),
        name: boardName
      }
    )

    if (addedDocRef) {
      const columnsColRef = collection(db, `${addedDocRef.path}/columns`)

      await updateDoc(addedDocRef, {
        docID: addedDocRef.id
      })

      boardColumns.forEach(async (column) => {
        const addedColumnRef = await addDoc(columnsColRef, {
          name: column
        })

        if (addedColumnRef) {
          await updateDoc(addedColumnRef, {
            docID: addedColumnRef.id
          })
        }
      })
    }

    chosenBoard.value = boards.value[0]
    localStorage.setItem('currentBoard', JSON.stringify(chosenBoard.value))
  }

  const deleteBoard = async () => {
    const docToEditRef = doc(
      boardsColRef.value as CollectionReference<DocumentData>,
      currentBoard.value?.docID
    )
    await deleteDoc(docToEditRef)

    if (boards.value.length) {
      chosenBoard.value = boards.value[0]
      localStorage.setItem('currentBoard', JSON.stringify(chosenBoard.value))
    }
  }

  return {
    boardsColRef,
    columnsColRef,
    boards,
    chosenBoard,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    isConfirmationPopupShown,
    action,
    getBoardsData,
    addNewBoard,
    deleteBoard
  }
})

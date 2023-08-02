import type { Board } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onSnapshot,
  query,
  orderBy,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentData,
  serverTimestamp
} from 'firebase/firestore'
import { db, usersColRef } from '../firebase'
import { useUserStore } from './user'

export const useBoardsStore = defineStore('boards', () => {
  const userStore = useUserStore()
  const boardsColRef = ref<null | CollectionReference<DocumentData>>(null)
  const boards = ref<Board[]>([])
  const chosenBoard = ref<null | Board>(null)
  const currentBoard = computed<null | Board>(() => {
    const savedBoard = JSON.parse(localStorage.getItem('currentBoard') || '{}')
    if (chosenBoard.value) return chosenBoard.value

    if (Object.keys(savedBoard).length) return savedBoard

    if (boards.value.length === 0) return null

    return boards.value[0]
  })

  const boardColumns = computed(() =>
    currentBoard.value ? currentBoard.value.columns : null
  )
  const boardColumnsNames = computed(() =>
    boardColumns.value?.map((column) => column.name)
  )

  const isConfirmationPopupShown = ref(false)
  const action = ref<'add' | 'edit' | 'delete'>('add')

  const isLoading = ref(true)
  onSnapshot(usersColRef, (snapshot) => {
    const userDocID = snapshot.docs.find(
      (doc) => doc.data().userID === userStore.userID
    )?.id

    boardsColRef.value = collection(db, `users/${userDocID}/boards`)
    const boardsColRefOrdered = query(
      boardsColRef.value as CollectionReference<DocumentData>,
      orderBy('createdAt', 'desc')
    )
    onSnapshot(boardsColRefOrdered, (snapshot) => {
      boards.value = snapshot.docs.map((doc) => doc.data() as Board)
    })

    isLoading.value = false
  })

  const addNewBoard = async (board: Omit<Board, 'docID' | 'createdAt'>) => {
    const addedDocRef = await addDoc(
      boardsColRef.value as CollectionReference<DocumentData>,
      {
        createdAt: serverTimestamp(),
        ...board
      }
    )

    if (addedDocRef) {
      await updateDoc(addedDocRef, {
        docID: addedDocRef.id
      })
    }

    chosenBoard.value = boards.value[0]
    localStorage.setItem('currentBoard', JSON.stringify(chosenBoard.value))
  }

  const editBoard = async (board: Omit<Board, 'docID' | 'createdAt'>) => {
    const docToEditRef = doc(
      boardsColRef.value as CollectionReference<DocumentData>,
      currentBoard.value?.docID
    )
    await updateDoc(docToEditRef, {
      ...board
    })

    chosenBoard.value = boards.value.find(
      (board) => board.docID === (currentBoard.value as Board).docID
    ) as Board
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
    isLoading,
    boards,
    chosenBoard,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    isConfirmationPopupShown,
    action,
    addNewBoard,
    editBoard,
    deleteBoard
  }
})

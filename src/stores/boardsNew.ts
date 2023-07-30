import type { Board } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  Query,
  DocumentData,
  Timestamp
} from 'firebase/firestore'
import { db, colRef } from '../firebase'
import { useUserStore } from './user'
import { nanoid } from 'nanoid'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const userStore = useUserStore()
  const userDocRef = ref<null | Query<DocumentData>>(null)
  const userDocID = ref('')
  const boards = ref<Board[]>([])
  const chosenBoard = ref<Board | null>(null)
  const currentBoard = computed(() => {
    if (boards.value.length === 0) return null

    if (chosenBoard.value) return chosenBoard.value

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
  if (userStore.currentUser) {
    const userID = userStore.currentUser.uid
    userDocRef.value = query(colRef, where('userID', '==', userID))

    onSnapshot(userDocRef.value, (snapshot) => {
      boards.value = snapshot.docs[0].data().boards
      userDocID.value = snapshot.docs[0].id
    })

    isLoading.value = false
  }

  const addNewBoard = async (board: Omit<Board, 'docID' | 'createdAt'>) => {
    await updateDoc(doc(db, 'users', userDocID.value), {
      boards: [
        ...boards.value,
        {
          createdAt: Timestamp.now(),
          docID: nanoid(),
          ...board
        }
      ]
    })

    chosenBoard.value = boards.value[0]
    localStorage.setItem('currentBoard', JSON.stringify(chosenBoard.value))
  }

  return {
    isLoading,
    userDocRef,
    boards,
    chosenBoard,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    isConfirmationPopupShown,
    action,
    addNewBoard
  }
})

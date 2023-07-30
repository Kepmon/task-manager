import type { Board } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { onSnapshot, query, where } from 'firebase/firestore'
import { colRef } from '../firebase'
import { useUserStore } from './user'

export const useBoardsNewStore = defineStore('boardsNew', () => {
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
  const userStore = useUserStore()
  if (userStore.currentUser) {
    const userID = userStore.currentUser.uid
    const userRef = query(colRef, where('userID', '==', userID))

    onSnapshot(userRef, (snapshot) => {
      const userData = snapshot.docs[0].data()
      boards.value = userData.boards
    })

    isLoading.value = false
  }

  return {
    isLoading,
    boards,
    chosenBoard,
    currentBoard,
    boardColumns,
    boardColumnsNames,
    isConfirmationPopupShown,
    action
  }
})

import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import type { Board, Subtask } from '../api/boardsTypes'
import { onSnapshot } from 'firebase/firestore'
import { colRef } from '../firebase'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const boards: Ref<Board[]> = ref([])
  const { uid } = JSON.parse(localStorage.getItem('user') || '{}')

  const updateBoardsData = onSnapshot(colRef, async (snapshot) => {
    try {
      const allUsers = snapshot.docs.map((doc) => doc.data())
      const currentUser = allUsers.filter((user) =>
        user.userID === uid ? user : null
      )[0]
      boards.value = currentUser['boards'] ? currentUser['boards'] : []
      return true
    } catch (err) {
      return false
    }
  })

  const boardsNames = ref(boards.value.map((board) => board.name))
  const boardsColumns = ref(boards.value.map((board) => board.columns))

  const returnNumberOfCompletedSubtasks = (arr: Subtask[]) =>
    arr.filter((subtask) => subtask.isCompleted === true).length

  return {
    boards,
    boardsNames,
    boardsColumns,
    updateBoardsData,
    returnNumberOfCompletedSubtasks
  }
})

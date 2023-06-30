import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import type { Board, Subtask } from '../api/boardsTypes'
import { getDocs } from 'firebase/firestore'
import { colRef } from '../firebase'

export const useBoardsNewStore = defineStore('boardsNew', () => {
  const boards: Ref<Board[]> = ref([])
  const { uid } = JSON.parse(localStorage.getItem('user') || '{}')

  const getBoardsData = async () => {
    try {
      const snapshot = await getDocs(colRef)
      const allUsers = snapshot.docs.map((doc) => doc.data())
      const currentUser = allUsers.filter((user) =>
        user.userID === uid ? user : null
      )[0]
      return currentUser['boards']
        ? (boards.value = currentUser['boards'])
        : (boards.value = [])
    } catch (err) {
      return false
    }
  }

  const returnNumberOfCompletedSubtasks = (arr: Subtask[]) =>
    arr.filter((subtask) => subtask.isCompleted === true).length

  return {
    getBoardsData,
    boards,
    returnNumberOfCompletedSubtasks
  }
})

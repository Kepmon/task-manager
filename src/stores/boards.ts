import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Board, Subtask } from '../api/boardsTypes'
import { boards as sampleBoards } from '../data/boards'
import { useFirestore } from '@vueuse/firebase'
import { doc } from 'firebase/firestore'
import { db } from '../firebase'
import { nanoid } from 'nanoid'

export const useBoardsStore = defineStore('boards', () => {
  const boardsQuery = ref('')
  const board = useFirestore(doc(db, 'boards', boardsQuery.value), [], {
    errorHandler(err) {
      // TODO: show error toast when failed
      console.error('Failed to retrieve boards data', err)
    }
  })

  return {
    board
  }
})

// export const useBoardsStore = defineStore('boards', () => {
//   const boards = ref<Board[]>(sampleBoards)

//   const { name: boardName, columns } = boards.value[0]
//   const { tasks } = columns[1]
//   const { title, description, status, subtasks } = tasks[5]

//   const returnNumberOfCompletedSubtasks = (arr: Subtask[]) =>
//     arr.filter((subtask) => subtask.isCompleted === true).length

//   return {
//     boards,
//     boardName,
//     columns,
//     title,
//     description,
//     status,
//     subtasks,
//     returnNumberOfCompletedSubtasks
//   }
// })

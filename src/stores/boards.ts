import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Board, Subtask } from '../api/boardsTypes'
import { boards as sampleBoards } from '../data/boards'

export const useBoardsStore = defineStore('boards', () => {
  const boards = ref<Board[]>(sampleBoards)

  const { name: boardName, columns } = boards.value[0]
  const { tasks } = columns[1]
  const { title, description, status, subtasks } = tasks[5]

  const returnNumberOfCompletedSubtasks = (arr: Subtask[]) =>
    arr.filter((subtask) => subtask.isCompleted === true).length

  return {
    boards,
    boardName,
    columns,
    title,
    description,
    status,
    subtasks,
    returnNumberOfCompletedSubtasks
  }
})

import type { Task } from '../api/boardsTypes'
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

export const returnSubtasksOfGivenTask = (
  taskID: undefined | Task['taskID']
) => {
  if (taskID == null) return []

  const userStore = useUserStore()
  const boardSubtasks = computed(
    () => userStore.userData.currentBoard.boardSubtasks
  )

  return boardSubtasks.value.find((subtasksArr) =>
    subtasksArr.every(({ taskID: id }) => id === taskID)
  )
}

export const returnRespectiveSubtaskIndex = (taskID: Task['taskID']) => {
  const userStore = useUserStore()
  const boardSubtasks = userStore.userData.currentBoard.boardSubtasks

  return boardSubtasks.findIndex((subtaskArr) =>
    subtaskArr.every(({ taskID: id }) => id === taskID)
  )
}

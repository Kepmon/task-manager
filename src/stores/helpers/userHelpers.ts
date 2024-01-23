import { BoardColumn, Subtask, Task } from '../../api/boardsTypes'
import { useUserStore } from '../user'

export const returnEmptyUserData = () => ({
  allBoards: [],
  fullBoards: [],
  currentBoard: {
    boardID: '',
    boardName: '',
    boardColumns: [] as BoardColumn[],
    columnOfClickedTask: null,
    boardTasks: [[]] as Task[][],
    clickedTask: null,
    boardSubtasks: [[]] as Subtask[][],
    subtasksOfClickedTask: [] as Subtask[]
  }
})

export const returnPartsOfUserData = () => {
  const userStore = useUserStore()

  return {
    allBoards: userStore.userData.allBoards,
    fullBoards: userStore.userData.fullBoards,
    currentBoard: userStore.userData.currentBoard,
    boardColumns: userStore.userData.currentBoard.boardColumns,
    boardTasks: userStore.userData.currentBoard.boardTasks,
    boardSubtasks: userStore.userData.currentBoard.boardSubtasks,
    clickedTask: userStore.userData.currentBoard.clickedTask,
    columnOfClickedTask: userStore.userData.currentBoard.columnOfClickedTask,
    subtasksOfClickedTask: userStore.userData.currentBoard.subtasksOfClickedTask
  }
}

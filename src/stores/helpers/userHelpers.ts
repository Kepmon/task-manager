import { BoardColumn, Subtask, Task } from '../../api/boardsTypes'

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
    boardSubtasks: [[[]]] as Subtask[][][],
    subtasksOfClickedTask: [] as Subtask[]
  }
})

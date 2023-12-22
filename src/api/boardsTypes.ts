export interface UserData {
  allBoards: Board[]
  currentBoard: {
    boardID: Board['boardID']
    boardName: Board['name']
    boardColumns: BoardColumn[]
    boardTasks: Task[][]
    boardSubtasks: Subtask[][][]
  }
}

export interface Board {
  boardID: string
  createdAt?: string
  name: string
}

export interface BoardColumn {
  columnID: string
  createdAt?: string
  name: string
  dotColor?: string
}

export interface Task {
  taskID: string
  createdAt?: string
  title: string
  description: string
}

export interface Subtask {
  subtaskID?: string
  title: string
  isCompleted: boolean
  createdAt?: string
}

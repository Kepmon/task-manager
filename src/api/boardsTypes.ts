import type { FieldValue } from 'firebase/firestore'

export interface UserData {
  allBoards: Board[]
  fullBoards: CurrentBoard[]
  currentBoard: CurrentBoard
}

interface CurrentBoard {
  boardID: Board['boardID']
  boardName: Board['name']
  boardColumns: BoardColumn[]
  columnOfClickedTask: null | number
  boardTasks: Task[][]
  clickedTask: null | Task
  boardSubtasks: Subtask[][]
  subtasksOfClickedTask: Subtask[]
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
  createdAt: string | FieldValue
  title: string
  description: string
  taskIndex: number
}

export interface Subtask {
  subtaskID: string
  taskID: string
  createdAt: string | FieldValue
  title: string
  isCompleted: boolean
}

export interface Board {
  boardID: string
  createdAt: string
  name: string
}

export interface BoardColumn {
  columnID: string
  createdAt: string
  name: string
}

export interface Task {
  taskID: string
  createdAt: string
  title: string
  description: string
}

export interface Subtask {
  subtaskID: string
  title: string
  isCompleted: boolean
  createdAt: string
}

interface FormSubsetItem {
  name: string
  id: string
}

export interface FormData {
  items: FormSubsetItem[]
  placeholderItems: string[] | undefined
  errors: boolean[]
}

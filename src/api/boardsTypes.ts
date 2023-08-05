export interface Board {
  docID: string
  createdAt: string
  name: string
}

export interface BoardColumn {
  docID: string
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

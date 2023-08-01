export interface Board {
  docID: string
  createdAt: string
  name: string
  columns: BoardColumn[]
}

export interface BoardColumn {
  name: string
  tasks: Task[]
}

export interface Task {
  title: string
  description: string
  status: string
  subtasks: Subtask[]
}

export interface Subtask {
  title: string
  isCompleted: boolean
}

export interface Board {
    name: string,
    columns: BoardColumn[]
}

export interface BoardColumn {
    name: string,
    tasks: Task[]
}

interface Task {
    title: string,
    description: string,
    status: string,
    subtasks: Subtask[]
}

export interface Subtask {
    title: string,
    isCompleted: boolean
}
export interface Board {
    name: string,
    columns: [] | BoardColumn[]
}

interface BoardColumn {
    name: string,
    tasks: [] | Task[]
}

interface Task {
    title: string,
    description: string,
    status: string,
    subtasks: [] | Subtask[]
}

interface Subtask {
    title: string,
    isCompleted: boolean
}
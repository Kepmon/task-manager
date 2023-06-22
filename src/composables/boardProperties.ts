import type { Board } from '../api/boardsTypes'
import { useBoardsStore } from '../stores/boards'

export const returnBoardProperties = () => {
  const { boards }: { boards: Board[] } = useBoardsStore()
  const { name: boardName, columns } = boards[0]
  const { tasks } = columns[1]
  const { title, description, status, subtasks } = tasks[5]

  return {
    boards,
    boardName,
    columns,
    title,
    description,
    status,
    subtasks
  }
}

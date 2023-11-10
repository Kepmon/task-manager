import type { Task } from './boardsTypes'

export interface MoveDragEvent extends DragEvent {
  from: HTMLElement
  to: HTMLElement
  draggedContext: {
    element: Task
  }
}

export interface DragEndEvent extends DragEvent {
  from: HTMLElement
  to: HTMLElement
  oldIndex: number
  newIndex: number
}

export interface DragTaskEvent {
  moved: {
    element: Task
    newIndex: number
    oldIndex: number
  }
  added: {
    element: Task
    newIndex: number
  }
  removed: {
    element: Task
    oldIndex: number
  }
}

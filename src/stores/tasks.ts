import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { updateDoc } from 'firebase/firestore'
import {
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useBoardsStore } from './boards'

export const useTasksStore = defineStore('tasks', () => {
  const boardsStore = useBoardsStore()

  const tasks = ref<Task[][]>([])
  const subtasks = ref<Subtask[][]>([])

  const isLoading = ref(true)
  const activeUserDocID = ref('')

  isLoading.value = false

  const addNewTask = async (
    selectedColumn: BoardColumn,
    task: Omit<Task, 'createdAt' | 'taskID'>,
    subtasks: Subtask['title'][]
  ) => {
    const tasksColRef = collection(
      db,
      `users/${activeUserDocID.value}/boards/${boardsStore.currentBoardID}/columns/${selectedColumn.columnID}/tasks`
    )

    const addedDocRef = await addDoc(tasksColRef, {
      createdAt: serverTimestamp(),
      ...task
    })

    if (addedDocRef) {
      await updateDoc(addedDocRef, {
        taskID: addedDocRef.id
      })
    }

    if (addedDocRef) {
      const taskID = addedDocRef.id
      const subtasksColRef = collection(
        db,
        `users/${activeUserDocID.value}/boards/${boardsStore.currentBoardID}/columns/${selectedColumn.columnID}/tasks/${taskID}/subtasks`
      )

      subtasks.forEach(async (subtask) => {
        await addDoc(subtasksColRef, {
          title: subtask,
          isCompleted: false,
          createdAt: serverTimestamp()
        })
      })
    }
  }

  return {
    isLoading,
    tasks,
    subtasks,
    addNewTask
  }
})

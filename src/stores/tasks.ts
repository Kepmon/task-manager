import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CollectionReference, DocumentData } from 'firebase/firestore'
import {
  onSnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db, usersColRef } from '../firebase'
import { useUserStore } from './user'
import { useBoardsStore } from './boards'

export const useTasksStore = defineStore('tasks', () => {
  const userStore = useUserStore()
  const boardsStore = useBoardsStore()
  const currentBoardID = computed(() => boardsStore.currentBoard?.docID || null)

  const tasks = ref<Task[][]>([])
  const subtasks = ref<Subtask[][][][]>([])
  const columnsColRef = ref<null | CollectionReference<DocumentData>>(null)

  const getTasksData = async (userDocID: string) => {
    const columnsColRef = collection(
      db,
      `users/${userDocID}/boards/${currentBoardID.value}/columns`
    )

    const columnDocs = await getDocs(columnsColRef)
    columnDocs.forEach(async (columnDoc) => {
      const columnTasksRef = collection(
        db,
        `users/${userDocID}/boards/${currentBoardID.value}/columns/${
          columnDoc.data().docID
        }/tasks`
      )
      const columnTasksDocs = (await getDocs(columnTasksRef)).docs

      const columnTasks = columnTasksDocs.map((taskDoc) => ({
        ...(taskDoc.data() as Omit<Task, 'taskID'>),
        taskID: taskDoc.id
      }))

      tasks.value.push(columnTasks)

      const subtasksArray = await Promise.all(
        tasks.value.map(
          async (taskSet) =>
            await Promise.all(
              taskSet.map(async (item) => {
                const subtasksColRefs = collection(
                  db,
                  `users/${userStore.userDocID}/boards/${
                    currentBoardID.value
                  }/columns/${columnDoc.data().docID}/tasks/${
                    item.taskID
                  }/subtasks`
                )

                const subtasksDocRefs = await getDocs(subtasksColRefs)
                return subtasksDocRefs.docs.map((docRef) => ({
                  ...(docRef.data() as Omit<Subtask, 'subtaskID'>),
                  subtaskID: docRef.id
                }))
              })
            )
        )
      )

      subtasks.value.push(subtasksArray)
    })
  }

  const addNewTask = async (
    selectedColumn: BoardColumn,
    task: Omit<Task, 'createdAt'>,
    subtasks: Subtask['title'][]
  ) => {
    const tasksColRef = collection(
      db,
      `users/${userStore.userDocID}/boards/${currentBoardID.value}/columns/${selectedColumn.docID}/tasks`
    )

    const addedDocRef = await addDoc(tasksColRef, {
      createdAt: serverTimestamp(),
      ...task
    })

    if (addedDocRef) {
      const taskID = addedDocRef.id
      const subtasksColRef = collection(
        db,
        `users/${userStore.userDocID}/boards/${currentBoardID.value}/columns/${selectedColumn.docID}/tasks/${taskID}/subtasks`
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
    tasks,
    subtasks,
    getTasksData,
    addNewTask
  }
})

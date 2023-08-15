import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type {
  CollectionReference,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { query, orderBy, getDocs } from 'firebase/firestore'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useUserStore } from './user'
import { useBoardsStore } from './boards'

export const useTasksStore = defineStore('tasks', () => {
  const userStore = useUserStore()
  const boardsStore = useBoardsStore()

  const tasks = ref<Task[][]>([])
  const subtasks = ref<Subtask[][][]>([])

  const getTasks = async (
    columnsColRef: CollectionReference<DocumentData>,
    columns: BoardColumn[]
  ) => {
    const returnedData =
      columns.length !== 0
        ? await Promise.all(
            columns.map(async (column) => {
              const tasksColRef = collection(
                db,
                `${columnsColRef.path}/${column.columnID}/tasks`
              )
              const tasksColRefOrdered = query(
                tasksColRef,
                orderBy('createdAt', 'asc')
              )

              const tasksDocRefs = (await getDocs(tasksColRefOrdered)).docs

              return {
                tasks: tasksDocRefs.map((tasksDocRef) => ({
                  ...(tasksDocRef.data() as Omit<Task, 'taskID'>),
                  taskID: tasksDocRef.id
                })),
                tasksDocRefs
              }
            })
          )
        : null

    if (returnedData != null) {
      tasks.value = returnedData.map((item) => item.tasks)

      const tasksDocRefsArr = returnedData.map((item) => item.tasksDocRefs)
      subtasks.value = await Promise.all(
        tasksDocRefsArr.map(
          async (tasksDocRefsArr) => await getSubtasks(tasksDocRefsArr)
        )
      )
    }
  }

  const getSubtasks = async (
    tasksDocRefs: QueryDocumentSnapshot<DocumentData>[]
  ) => {
    return await Promise.all(
      tasksDocRefs.map(async (tasksDocRef) => {
        const subtasksColRef = collection(
          db,
          `${tasksDocRef.ref.path}/subtasks`
        )
        const subtasksColRefOrdered = query(
          subtasksColRef,
          orderBy('createdAt', 'asc')
        )

        const subtasksDocRefs = (await getDocs(subtasksColRefOrdered)).docs

        if (subtasksDocRefs.length !== 0) {
          return subtasksDocRefs.map((subtasksDocRef) => ({
            ...(subtasksDocRef.data() as Omit<Subtask, 'subtaskID'>),
            subtaskID: subtasksDocRef.id
          }))
        }

        return []
      })
    )
  }

  const addNewTask = async (
    selectedColumn: BoardColumn,
    task: Omit<Task, 'createdAt' | 'taskID'>,
    subtasks: Subtask['title'][]
  ) => {
    const tasksColRef = collection(
      db,
      `users/${userStore.userID}/boards/${boardsStore.currentBoardID}/columns/${selectedColumn.columnID}/tasks`
    )

    const addedDocRef = await addDoc(tasksColRef, {
      createdAt: serverTimestamp(),
      ...task
    })

    if (addedDocRef) {
      const subtasksColRef = collection(db, `${addedDocRef.path}/subtasks`)

      subtasks.forEach(async (subtask) => {
        await addDoc(subtasksColRef, {
          title: subtask,
          isCompleted: false,
          createdAt: serverTimestamp()
        })
      })

      await boardsStore.getColumns()
    }
  }

  return {
    tasks,
    subtasks,
    getTasks,
    getSubtasks,
    addNewTask
  }
})

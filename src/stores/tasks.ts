import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type {
  CollectionReference,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { query, orderBy, getDocs } from 'firebase/firestore'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
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
    columnID: BoardColumn['columnID'],
    task: Omit<Task, 'createdAt' | 'taskID'> | Omit<Task, 'taskID'>,
    subtasks: Subtask['title'][]
  ) => {
    const tasksColRef = collection(
      db,
      `users/${userStore.userID}/boards/${boardsStore.currentBoardID}/columns/${columnID}/tasks`
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
    }
  }

  const moveTaskBetweenColumns = async (
    prevColumnID: BoardColumn['columnID'],
    nextColumnID: BoardColumn['columnID'],
    task: Task
  ) => {
    const colRefPathPrefix = `users/${userStore.userID}/boards/${boardsStore.currentBoardID}/columns`
    const prevTasksColRef = collection(
      db,
      `${colRefPathPrefix}/${prevColumnID}/tasks`
    )
    const nextTasksColRef = collection(
      db,
      `${colRefPathPrefix}/${nextColumnID}/tasks`
    )
    const prevTaskDocRef = doc(prevTasksColRef, task.taskID)
    const nextTaskDocRef = doc(nextTasksColRef, task.taskID)

    const prevSubtasksColRef = collection(db, `${prevTaskDocRef.path}/subtasks`)
    const nextSubtasksColRef = collection(db, `${nextTaskDocRef.path}/subtasks`)
    const prevSubtaskDocRefs = (await getDocs(prevSubtasksColRef)).docs
    const subtasks = prevSubtaskDocRefs.map((subtask, index) => ({
      ...(subtask.data() as Omit<Subtask, 'subtaskID'>),
      subtaskID: prevSubtaskDocRefs[index].id
    }))

    await deleteTask(prevColumnID, task.taskID)

    await setDoc(nextTaskDocRef, {
      createdAt: task.createdAt,
      title: task.title,
      description: task.description
    })

    if (subtasks.length > 0) {
      subtasks.forEach(async (subtask) => {
        const subtaskDocRef = doc(nextSubtasksColRef, subtask.subtaskID)
        await setDoc(subtaskDocRef, {
          title: subtask.title,
          isCompleted: subtask.isCompleted,
          createdAt: subtask.createdAt
        })
      })
    }
  }

  const deleteTask = async (
    columnID: BoardColumn['columnID'],
    taskID: Task['taskID']
  ) => {
    const tasksColRef = collection(
      db,
      `users/${userStore.userID}/boards/${boardsStore.currentBoardID}/columns/${columnID}/tasks`
    )
    const tasksDocRef = doc(tasksColRef, taskID)

    const subtasksColRef = collection(db, `${tasksDocRef.path}/subtasks`)
    // const columnDocRef = doc(columnsColRef, columnID)
    // const tasksColRefs = collection(db, `${columnDocRef.path}/tasks`)
    // const tasksDocRefs = await getDocs(tasksColRefs)
    // if (tasksDocRefs.docs.length !== 0) {
    // tasksDocRefs.forEach(async (tasksDocRef) => {
    const subtasksDocRefs = await getDocs(subtasksColRef)
    if (subtasksDocRefs.docs.length !== 0) {
      subtasksDocRefs.forEach(async (subtasksDocRef) => {
        await deleteDoc(subtasksDocRef.ref)
      })
    }

    await deleteDoc(tasksDocRef)
    // })
    // }

    // await deleteDoc(columnDocRef)
    // await boardsStore.getColumns()
  }

  return {
    tasks,
    subtasks,
    getTasks,
    getSubtasks,
    addNewTask,
    moveTaskBetweenColumns,
    deleteTask
  }
})

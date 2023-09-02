import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type {
  CollectionReference,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { query, orderBy, getDocs } from 'firebase/firestore'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
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

  const columnOfClickedTask = ref<null | number>(null)
  const clickedTask = ref<null | Task>(null)
  const subtasksOfClickedTask = ref<null | Subtask[]>(null)
  const subtasksNames = computed(() =>
    subtasksOfClickedTask.value
      ? subtasksOfClickedTask.value.map((subtask) => subtask.title)
      : []
  )

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

      if (subtasks.length === 0) return

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
    nextColumnID: BoardColumn['columnID']
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
    const prevTaskDocRef = doc(
      prevTasksColRef,
      (clickedTask.value as Task).taskID
    )
    const nextTaskDocRef = doc(
      nextTasksColRef,
      (clickedTask.value as Task).taskID
    )

    const prevSubtasksColRef = collection(db, `${prevTaskDocRef.path}/subtasks`)
    const nextSubtasksColRef = collection(db, `${nextTaskDocRef.path}/subtasks`)
    const prevSubtaskDocRefs = (await getDocs(prevSubtasksColRef)).docs
    const subtasks = prevSubtaskDocRefs.map((subtask, index) => ({
      ...(subtask.data() as Omit<Subtask, 'subtaskID'>),
      subtaskID: prevSubtaskDocRefs[index].id
    }))

    await deleteTask(prevColumnID, (clickedTask.value as Task).taskID)

    await setDoc(nextTaskDocRef, {
      createdAt: (clickedTask.value as Task).createdAt,
      title: (clickedTask.value as Task).title,
      description: (clickedTask.value as Task).description
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

  const editTask = async (
    taskName: string,
    taskDescription: string,
    updatedSubtaskNames: string[],
    prevColumnID: undefined | BoardColumn['columnID'],
    nextColumnID: BoardColumn['columnID'],
    isStatusChanged: boolean
  ) => {
    const columnsColRef = collection(
      db,
      `users/${userStore.userID}/boards/${boardsStore.currentBoardID}/columns`
    )
    const columnDocRef = (await getDocs(columnsColRef)).docs[
      columnOfClickedTask.value as number
    ]
    const tasksColRef = collection(db, `${columnDocRef.ref.path}/tasks`)
    const taskDocRef = doc(tasksColRef, (clickedTask.value as Task).taskID)
    const subtasksColRef = collection(db, `${taskDocRef.path}/subtasks`)

    if (taskName !== (clickedTask.value as Task).title) {
      await updateDoc(taskDocRef, {
        title: taskName
      })
    }

    if (taskDescription !== (clickedTask.value as Task).description) {
      await updateDoc(taskDocRef, {
        description: taskDescription
      })
    }

    if (isStatusChanged) {
      await moveTaskBetweenColumns(
        prevColumnID as BoardColumn['columnID'],
        nextColumnID
      )
    }

    if (subtasksOfClickedTask.value != null) {
      subtasksOfClickedTask.value.forEach(async (subtask, index) => {
        const subtaskDocRef = doc(subtasksColRef, subtask.subtaskID)

        if (updatedSubtaskNames[index] == null) {
          await deleteDoc(subtaskDocRef)
          return
        }

        if (updatedSubtaskNames[index] === subtask.title) return

        await updateDoc(subtaskDocRef, {
          title: updatedSubtaskNames[index]
        })
      })

      if (updatedSubtaskNames.length > subtasksOfClickedTask.value.length) {
        updatedSubtaskNames.forEach(async (subtaskName, index) => {
          if (
            subtasksOfClickedTask.value != null &&
            subtasksOfClickedTask.value[index] != null &&
            (subtasksOfClickedTask.value as Subtask[])[index].title != null
          )
            return

          await addDoc(subtasksColRef, {
            title: subtaskName,
            isCompleted: false,
            createdAt: serverTimestamp()
          })
        })
      }
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
    const subtasksDocRefs = await getDocs(subtasksColRef)
    if (subtasksDocRefs.docs.length !== 0) {
      subtasksDocRefs.forEach(async (subtasksDocRef) => {
        await deleteDoc(subtasksDocRef.ref)
      })
    }

    await deleteDoc(tasksDocRef)
    await boardsStore.getColumns()
  }

  const toggleSubtask = async (subtask: Subtask) => {
    const subtasksColRef = collection(
      db,
      `users/${userStore.userID}/boards/${boardsStore.currentBoardID}/columns/${
        boardsStore.boardColumns[columnOfClickedTask.value as number].columnID
      }/tasks/${(clickedTask.value as Task).taskID}/subtasks`
    )
    const subtaskDocRef = doc(subtasksColRef, subtask.subtaskID)

    await updateDoc(subtaskDocRef, {
      isCompleted: !subtask.isCompleted
    })
  }

  return {
    tasks,
    subtasks,
    clickedTask,
    columnOfClickedTask,
    subtasksOfClickedTask,
    subtasksNames,
    getTasks,
    getSubtasks,
    addNewTask,
    moveTaskBetweenColumns,
    editTask,
    deleteTask,
    toggleSubtask
  }
})

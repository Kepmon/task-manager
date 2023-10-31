import type {
  BoardColumn,
  Task,
  Subtask,
  FormSubsetItem
} from '../api/boardsTypes'
import type {
  CollectionReference,
  QueryDocumentSnapshot,
  Query,
  DocumentData,
  FirestoreError
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { query, orderBy, getDocs } from 'firebase/firestore'
import {
  collection,
  doc,
  getDoc,
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

  const columnsColRefPrefix = computed(() =>
    boardsStore.currentBoard != null
      ? `users/${userStore.userID}/boards/${boardsStore.currentBoard?.boardID}/columns`
      : null
  )

  const tasks = ref<Task[][]>([])
  const subtasks = ref<Subtask[][][]>([])

  const columnOfClickedTask = ref<null | number>(null)
  const clickedTask = ref<null | Task>(null)
  const subtasksOfClickedTask = ref<Subtask[]>([])

  const getColumnsAgain = async () => {
    try {
      const response = await boardsStore.getColumns()

      if (response !== true) throw new Error(response)
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

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

              try {
                const tasksDocRefs = (await getDocs(tasksColRefOrdered)).docs

                if (tasksDocRefs == null) throw new Error('wrong response')

                return {
                  tasks: tasksDocRefs.map((tasksDocRef) => ({
                    ...(tasksDocRef.data() as Omit<Task, 'taskID'>),
                    taskID: tasksDocRef.id
                  })),
                  tasksDocRefs
                }
              } catch (err) {
                return (err as FirestoreError).code
              }
            })
          )
        : null

    const isReturnedDataOk = returnedData?.every(
      (item) => typeof item !== 'string'
    )
    if (returnedData != null && isReturnedDataOk) {
      interface ReturnedData {
        tasks: Task[]
        tasksDocRefs: QueryDocumentSnapshot<DocumentData>[]
      }
      tasks.value = (returnedData as ReturnedData[]).map((item) => item.tasks)

      const tasksDocRefsArr = (returnedData as ReturnedData[]).map(
        (item) => item.tasksDocRefs
      )

      const response = await Promise.all(
        tasksDocRefsArr.map(
          async (tasksDocRefsArr) => await getSubtasks(tasksDocRefsArr)
        )
      )

      if (typeof response !== 'string') {
        subtasks.value = response as Subtask[][][]
      }

      return true
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

        try {
          const subtasksDocRefs = (await getDocs(subtasksColRefOrdered)).docs

          if (subtasksDocRefs.length === 0) return []

          return subtasksDocRefs.map((subtasksDocRef) => ({
            ...(subtasksDocRef.data() as Omit<Subtask, 'subtaskID'>),
            subtaskID: subtasksDocRef.id
          }))
        } catch (err) {
          return (err as FirestoreError).code
        }
      })
    )
  }

  const updateSubtasks = async (
    subtaskColRef: CollectionReference<DocumentData> | Query<DocumentData>
  ) => {
    try {
      const subtasksDocRefs = (await getDocs(subtaskColRef)).docs

      if (subtasksDocRefs.length === 0) return []

      return subtasksDocRefs.map((subtasksDocRef) => ({
        ...(subtasksDocRef.data() as Omit<Subtask, 'subtaskID'>),
        subtaskID: subtasksDocRef.id
      }))
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const addNewTask = async (
    columnID: BoardColumn['columnID'],
    task: Omit<Task, 'createdAt' | 'taskID'> | Omit<Task, 'taskID'>,
    subtasks: Subtask['title'][]
  ) => {
    const tasksColRef = collection(
      db,
      `${columnsColRefPrefix.value}/${columnID}/tasks`
    )

    try {
      const addedDocRef = await addDoc(tasksColRef, {
        createdAt: serverTimestamp(),
        ...task
      })
      if (addedDocRef == null) throw new Error('wrong response')

      const subtasksColRef = collection(db, `${addedDocRef.path}/subtasks`)

      if (subtasks.length === 0) {
        await getColumnsAgain()
        return true
      }

      subtasks.forEach(async (subtask) => {
        try {
          const response = await addDoc(subtasksColRef, {
            title: subtask,
            isCompleted: false,
            createdAt: serverTimestamp()
          })

          if (response == null) throw new Error(response)
        } catch (err) {
          return (err as FirestoreError).code
        }
      })

      await getColumnsAgain()

      return true
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const moveTaskBetweenColumns = async (
    nextColumnID: BoardColumn['columnID'],
    previousColumnID?: BoardColumn['columnID'],
    taskToBeDragged?: Task
  ) => {
    const prevColumnID =
      previousColumnID != null
        ? previousColumnID
        : boardsStore.boardColumns[columnOfClickedTask.value as number].columnID
    const prevTasksColRef = collection(
      db,
      `${columnsColRefPrefix.value}/${prevColumnID}/tasks`
    )
    const nextTasksColRef = collection(
      db,
      `${columnsColRefPrefix.value}/${nextColumnID}/tasks`
    )

    const prevTaskDocRef = doc(
      prevTasksColRef,
      taskToBeDragged != null
        ? taskToBeDragged.taskID
        : (clickedTask.value as Task).taskID
    )
    const nextTaskDocRef = doc(
      nextTasksColRef,
      taskToBeDragged != null
        ? taskToBeDragged.taskID
        : (clickedTask.value as Task).taskID
    )
    const prevSubtasksColRef = collection(db, `${prevTaskDocRef.path}/subtasks`)
    const nextSubtasksColRef = collection(db, `${nextTaskDocRef.path}/subtasks`)

    try {
      const prevSubtaskDocRefs = (await getDocs(prevSubtasksColRef)).docs

      if (prevSubtaskDocRefs == null) throw new Error('wrong response')

      const subtasks = prevSubtaskDocRefs.map((subtask, index) => ({
        ...(subtask.data() as Omit<Subtask, 'subtaskID'>),
        subtaskID: prevSubtaskDocRefs[index].id
      }))

      try {
        await setDoc(nextTaskDocRef, {
          createdAt:
            taskToBeDragged != null
              ? taskToBeDragged.createdAt
              : (clickedTask.value as Task).createdAt,
          title:
            taskToBeDragged != null
              ? taskToBeDragged.title
              : (clickedTask.value as Task).title,
          description:
            taskToBeDragged != null
              ? taskToBeDragged.description
              : (clickedTask.value as Task).description
        })

        const deleteResponse =
          taskToBeDragged != null
            ? await deleteTask(taskToBeDragged.taskID, prevColumnID)
            : await deleteTask()
        if (deleteResponse !== true) throw new Error(deleteResponse)
      } catch (err) {
        return (err as FirestoreError).code
      }

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

      await getColumnsAgain()

      return true
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const editTask = async (
    taskName: string,
    taskDescription: string,
    updatedSubtasks: FormSubsetItem[],
    nextColumnID: BoardColumn['columnID'],
    isStatusChanged: boolean
  ) => {
    const columnsColRef = collection(db, columnsColRefPrefix.value as string)

    const clickedColumnID =
      boardsStore.boardColumns[columnOfClickedTask.value as number].columnID

    const columnDocRef = doc(columnsColRef, clickedColumnID)

    const tasksColRef = collection(db, `${columnDocRef.path}/tasks`)
    const taskDocRef = doc(tasksColRef, (clickedTask.value as Task).taskID)
    const subtasksColRef = collection(db, `${taskDocRef.path}/subtasks`)

    const isTaskNameSame = taskName === (clickedTask.value as Task).title
    const isDescriptionSame =
      taskDescription === (clickedTask.value as Task).description
    const isNumberOfSubtaskSame =
      subtasksOfClickedTask.value.length === updatedSubtasks.length
    const areSubtasksTitlesSame = subtasksOfClickedTask.value.every(
      ({ subtaskID, title }) =>
        updatedSubtasks.find(
          ({ name, id }) => title === name && subtaskID === id
        )
    )

    const isFormNotChanged = [
      isTaskNameSame,
      isDescriptionSame,
      isNumberOfSubtaskSame,
      areSubtasksTitlesSame
    ].every((item) => item === true)

    if (isFormNotChanged && !isStatusChanged) return true

    try {
      if (!isTaskNameSame) {
        await updateDoc(taskDocRef, {
          title: taskName
        })
      }

      if (!isDescriptionSame) {
        await updateDoc(taskDocRef, {
          description: taskDescription
        })
      }

      if (isStatusChanged) {
        const response = await moveTaskBetweenColumns(nextColumnID)

        if (response !== true) throw new Error(response)
      }
    } catch (err) {
      return (err as FirestoreError).code
    }

    const newSubtasksNames = updatedSubtasks.filter(({ name, id }) => {
      if (
        subtasksOfClickedTask.value.length > 0 &&
        subtasksOfClickedTask.value.some(({ subtaskID }) => subtaskID === id)
      )
        return

      return name
    })

    if (newSubtasksNames.length > 0) {
      newSubtasksNames.forEach(async ({ name }) => {
        try {
          const response = await addDoc(subtasksColRef, {
            title: name,
            isCompleted: false,
            createdAt: serverTimestamp()
          })

          if (response == null) throw new Error('wrong response')
        } catch (err) {
          return (err as FirestoreError).code
        }
      })
    }

    if (subtasksOfClickedTask.value.length > 0) {
      subtasksOfClickedTask.value.forEach(
        async ({ subtaskID, title }, index) => {
          const subtaskDocRef = doc(subtasksColRef, subtaskID)

          const respectiveSubtask = updatedSubtasks.find(
            ({ id }) => id === subtaskID
          )
          const isSubtaskNameSame = respectiveSubtask?.name === title

          if (respectiveSubtask && isSubtaskNameSame) return

          if (respectiveSubtask == null) {
            try {
              await deleteDoc(subtaskDocRef)
              return
            } catch (err) {
              return (err as FirestoreError).code
            }
          }

          try {
            await updateDoc(subtaskDocRef, {
              title: updatedSubtasks[index].name
            })
          } catch (err) {
            return (err as FirestoreError).code
          }
        }
      )
    }

    await getColumnsAgain()

    return true
  }

  const deleteTask = async (
    taskID?: Task['taskID'],
    columnID?: BoardColumn['columnID']
  ) => {
    const deletedTaskID = taskID != null ? taskID : clickedTask.value?.taskID
    const columnOfDeletedTaskID =
      columnID != null
        ? columnID
        : boardsStore.boardColumns[columnOfClickedTask.value as number].columnID

    const tasksColRef = collection(
      db,
      `${columnsColRefPrefix.value}/${columnOfDeletedTaskID}/tasks`
    )
    const tasksDocRef = doc(tasksColRef, deletedTaskID)

    const subtasksColRef = collection(db, `${tasksDocRef.path}/subtasks`)

    try {
      const subtasksDocRefs = await getDocs(subtasksColRef)
      if (subtasksDocRefs.docs.length !== 0) {
        subtasksDocRefs.forEach(async (subtasksDocRef) => {
          try {
            await deleteDoc(subtasksDocRef.ref)
            return true
          } catch (err) {
            return (err as FirestoreError).code
          }
        })
      }

      try {
        await deleteDoc(tasksDocRef)
        await getColumnsAgain()
        return true
      } catch (err) {
        return (err as FirestoreError).code
      }
    } catch (err) {
      return (err as FirestoreError).code
    }
  }

  const toggleSubtask = async (subtask: Subtask) => {
    const subtasksColRef = collection(
      db,
      `${columnsColRefPrefix.value}/${
        boardsStore.boardColumns[columnOfClickedTask.value as number].columnID
      }/tasks/${(clickedTask.value as Task).taskID}/subtasks`
    )
    const subtasksColRefOrdered = query(
      subtasksColRef,
      orderBy('createdAt', 'asc')
    )
    const subtaskDocRef = doc(subtasksColRef, subtask.subtaskID)

    const statusBefore = subtask.isCompleted

    try {
      await updateDoc(subtaskDocRef, {
        isCompleted: !subtask.isCompleted
      })
    } catch (err) {
      return (err as FirestoreError).code
    }

    try {
      const subtasksResponse = await updateSubtasks(subtasksColRefOrdered)
      if (typeof subtasksResponse === 'string')
        throw new Error(subtasksResponse)

      subtasksOfClickedTask.value = subtasksResponse
    } catch (err) {
      return (err as FirestoreError).code
    }

    const statusAfter = ((await getDoc(subtaskDocRef)).data() as Subtask)
      .isCompleted

    if (statusBefore === statusAfter) return 'wrong response'

    try {
      await getColumnsAgain()
    } catch (err) {
      return (err as FirestoreError).code
    }

    return true
  }

  return {
    tasks,
    subtasks,
    clickedTask,
    columnOfClickedTask,
    subtasksOfClickedTask,
    getTasks,
    addNewTask,
    moveTaskBetweenColumns,
    editTask,
    deleteTask,
    toggleSubtask
  }
})

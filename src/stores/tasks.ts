import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type {
  CollectionReference,
  QueryDocumentSnapshot,
  DocumentData,
  FirestoreError
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  query,
  orderBy,
  getDocs,
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
import { useFormsStore } from './forms'

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
              const tasksColRefOrderedByIndex = query(
                tasksColRef,
                orderBy('taskIndex', 'asc')
              )
              const tasksColRefOrderedByDate = query(
                tasksColRef,
                orderBy('createdAt', 'asc')
              )

              try {
                const tasksDocRefs = (await getDocs(tasksColRefOrderedByIndex))
                  .docs

                const tasksOrderedByDate = (
                  await getDocs(tasksColRefOrderedByDate)
                ).docs

                tasksOrderedByDate.forEach((dateTask) => {
                  const isTaskDocAlreadyInArr = tasksDocRefs.some(
                    (taskDocRef) => taskDocRef.id === dateTask.id
                  )

                  if (!isTaskDocAlreadyInArr) {
                    tasksDocRefs.push(dateTask)
                  }
                })

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

  const addNewTask = async (
    columnID: BoardColumn['columnID'],
    action: 'add' | 'edit'
  ) => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.task[action].data

    const tasksColRef = collection(
      db,
      `${columnsColRefPrefix.value}/${columnID}/tasks`
    )

    try {
      const addedDocRef = await addDoc(tasksColRef, {
        createdAt: serverTimestamp(),
        title: formData.name,
        description: formData.description
      })
      if (addedDocRef == null) throw new Error('wrong response')

      const subtasksColRef = collection(db, `${addedDocRef.path}/subtasks`)

      if (formData.items.length === 0) {
        await getColumnsAgain()
        return true
      }

      formData.items.forEach(async ({ name }) => {
        try {
          const response = await addDoc(subtasksColRef, {
            title: name,
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

  const setNewIndexesForTheSameColumn = (
    indexOfNewColumn: number,
    oldIndex: number,
    newIndex: number
  ) => {
    if (oldIndex === newIndex) return

    const subtasksForNewColumn = subtasks.value[indexOfNewColumn]

    let subtasksBefore: Subtask[][] = []
    let subtasksAfter: Subtask[][] = []

    if (oldIndex > newIndex) {
      subtasksBefore = subtasksForNewColumn.slice(0, newIndex)
      subtasksAfter = [
        ...subtasksForNewColumn.slice(0, oldIndex).slice(newIndex),
        ...subtasksForNewColumn.slice(oldIndex + 1)
      ]
    }

    if (oldIndex < newIndex) {
      subtasksAfter = subtasksForNewColumn.slice(newIndex + 1)
      subtasksBefore = [
        ...subtasksForNewColumn.slice(0, oldIndex),
        ...subtasksForNewColumn.slice(oldIndex + 1, newIndex + 1)
      ]
    }

    const movedSubtasks = subtasksForNewColumn[oldIndex]

    subtasks.value[indexOfNewColumn] = [
      ...subtasksBefore,
      movedSubtasks,
      ...subtasksAfter
    ]
  }

  const setNewIndexesForDifferentColumns = (
    indexOfOldColumn: number,
    indexOfNewColumn: number,
    oldIndex: number,
    newIndex: number
  ) => {
    const subtasksForOldColumn = [...subtasks.value[indexOfOldColumn]]
    const subtasksForNewColumn = [...subtasks.value[indexOfNewColumn]]

    const oldSubtasksBefore = subtasksForOldColumn.slice(0, oldIndex)
    const oldSubtasksAfter = subtasksForOldColumn.slice(oldIndex + 1)
    const newSubtasksBefore = subtasksForNewColumn.slice(0, newIndex)
    const newSubtasksAfter = subtasksForNewColumn.slice(newIndex)
    const movedSubtasks = subtasksForOldColumn[oldIndex]

    subtasks.value[indexOfOldColumn] = [
      ...oldSubtasksBefore,
      ...oldSubtasksAfter
    ]

    subtasks.value[indexOfNewColumn] = [
      ...newSubtasksBefore,
      movedSubtasks,
      ...newSubtasksAfter
    ]
  }

  const addIndexesToTasks = async (
    taskIndexes: { taskID: Task['taskID']; taskIndex: number }[],
    columnID: BoardColumn['columnID']
  ) => {
    const nextTasksColRef = collection(
      db,
      `${columnsColRefPrefix.value}/${columnID}/tasks`
    )

    taskIndexes.forEach(async (task) => {
      const taskDocRef = doc(nextTasksColRef, task.taskID)
      const taskIndex = taskIndexes.find(
        (task) => task.taskID === taskDocRef.id
      )?.taskIndex

      await updateDoc(taskDocRef, { taskIndex })
    })
  }

  const moveTaskBetweenColumns = async (
    nextColumnID: BoardColumn['columnID'],
    previousColumnID?: BoardColumn['columnID'],
    taskToBeDragged?: Task,
    taskIndexes?: { taskID: Task['taskID']; taskIndex: number }[]
  ) => {
    const prevColumnID =
      previousColumnID != null
        ? previousColumnID
        : boardsStore.boardColumns[columnOfClickedTask.value as number].columnID

    const prevColumnIndex = boardsStore.boardColumns.findIndex(
      ({ columnID }) => columnID === prevColumnID
    )
    const nextColumnIndex = boardsStore.boardColumns.findIndex(
      ({ columnID }) => columnID === nextColumnID
    )
    const indexOfTaskColumn =
      taskToBeDragged != null ? nextColumnIndex : prevColumnIndex
    const taskIndex = tasks.value[indexOfTaskColumn].findIndex(({ taskID }) =>
      taskToBeDragged != null
        ? taskID === taskToBeDragged.taskID
        : taskID === clickedTask.value?.taskID || 0
    )

    const movedTask = tasks.value[indexOfTaskColumn][taskIndex]
    const subtasksOfMovedTask = subtasks.value[indexOfTaskColumn][taskIndex]

    if (nextColumnID === previousColumnID && taskIndexes != null) {
      addIndexesToTasks(taskIndexes, nextColumnID)
      return
    }

    const nextTasksColRef = collection(
      db,
      `${columnsColRefPrefix.value}/${nextColumnID}/tasks`
    )

    const nextTaskDocRef = doc(
      nextTasksColRef,
      tasks.value[indexOfTaskColumn][taskIndex].taskID
    )
    const nextSubtasksColRef = collection(db, `${nextTaskDocRef.path}/subtasks`)

    try {
      await setDoc(nextTaskDocRef, {
        createdAt: movedTask.createdAt,
        title: movedTask.title,
        description: movedTask.description
      })

      if (taskIndexes != null && taskIndexes.length > 0) {
        addIndexesToTasks(taskIndexes, nextColumnID)
      }

      const deleteResponse =
        taskToBeDragged != null
          ? await deleteTask(taskToBeDragged.taskID, prevColumnID)
          : await deleteTask()
      if (deleteResponse !== true) throw new Error(deleteResponse)

      if (taskToBeDragged == null) {
        tasks.value[prevColumnIndex] = tasks.value[prevColumnIndex].filter(
          ({ taskID }) => movedTask.taskID !== taskID
        )
        tasks.value[nextColumnIndex] = [
          ...tasks.value[nextColumnIndex],
          movedTask
        ]
      }
    } catch (err) {
      return (err as FirestoreError).code
    }

    if (subtasksOfMovedTask.length > 0) {
      subtasksOfMovedTask.forEach(async (subtask) => {
        const subtaskDocRef = doc(nextSubtasksColRef, subtask.subtaskID)

        try {
          await deleteDoc(subtaskDocRef)

          await setDoc(subtaskDocRef, {
            title: subtask.title,
            isCompleted: subtask.isCompleted,
            createdAt: subtask.createdAt
          })
        } catch (err) {
          return (err as FirestoreError).code
        }

        if (taskToBeDragged == null) {
          subtasks.value[prevColumnIndex] = subtasks.value[
            prevColumnIndex
          ].filter((_, index) => taskIndex != index)

          subtasks.value[nextColumnIndex] = [
            ...subtasks.value[nextColumnIndex],
            subtasksOfMovedTask
          ]
        }
      })
    }

    columnOfClickedTask.value = nextColumnIndex
    return true
  }

  const editTask = async (
    action: 'add' | 'edit',
    nextColumnID: BoardColumn['columnID'],
    isStatusChanged: boolean
  ) => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.task[action].data

    const columnsColRef = collection(db, columnsColRefPrefix.value as string)

    const clickedColumnID =
      boardsStore.boardColumns[columnOfClickedTask.value as number].columnID

    const columnDocRef = doc(columnsColRef, clickedColumnID)

    const tasksColRef = collection(db, `${columnDocRef.path}/tasks`)
    const taskDocRef = doc(tasksColRef, (clickedTask.value as Task).taskID)
    const subtasksColRef = collection(db, `${taskDocRef.path}/subtasks`)

    const isTaskNameSame = formData.name === (clickedTask.value as Task).title
    const isDescriptionSame =
      formData.description === (clickedTask.value as Task).description
    const isNumberOfSubtaskSame =
      subtasksOfClickedTask.value.length === formData.items.length
    const areSubtasksTitlesSame = subtasksOfClickedTask.value.every(
      ({ subtaskID, title }) =>
        formData.items.find(
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
          title: formData.name
        })
      }

      if (!isDescriptionSame) {
        await updateDoc(taskDocRef, {
          description: formData.description
        })
      }
    } catch (err) {
      return (err as FirestoreError).code
    }

    const newSubtasksNames = formData.items.filter(({ name, id }) => {
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

          const respectiveSubtask = formData.items.find(
            ({ id }) => id === subtaskID
          )
          const isSubtaskNameSame = respectiveSubtask?.name === title

          if (respectiveSubtask && isSubtaskNameSame) return

          if (respectiveSubtask == null) {
            try {
              await deleteDoc(subtaskDocRef)
            } catch (err) {
              return (err as FirestoreError).code
            }
          }

          try {
            await updateDoc(subtaskDocRef, {
              title: formData.items[index].name
            })
          } catch (err) {
            return (err as FirestoreError).code
          }
        }
      )
    }

    try {
      if (isStatusChanged) {
        const response = await moveTaskBetweenColumns(nextColumnID)

        if (response !== true) throw new Error(response)
      }
    } catch (err) {
      return (err as FirestoreError).code
    }

    clickedTask.value = null

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
    const subtaskDocRef = doc(subtasksColRef, subtask.subtaskID)

    try {
      await updateDoc(subtaskDocRef, {
        isCompleted: !subtask.isCompleted
      })
    } catch (err) {
      return (err as FirestoreError).code
    }

    subtasksOfClickedTask.value = subtasksOfClickedTask.value.map(
      (subtaskOfClickedTask) => {
        if (subtaskOfClickedTask.subtaskID !== subtask.subtaskID)
          return subtaskOfClickedTask

        subtaskOfClickedTask.isCompleted = !subtaskOfClickedTask.isCompleted
        return subtaskOfClickedTask
      }
    )

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
    setNewIndexesForTheSameColumn,
    setNewIndexesForDifferentColumns,
    addIndexesToTasks,
    moveTaskBetweenColumns,
    editTask,
    deleteTask,
    toggleSubtask
  }
})

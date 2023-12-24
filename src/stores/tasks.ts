import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type {
  CollectionReference,
  DocumentData,
  FirestoreError
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
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

  const getTasks = async (
    columnsColRef: null | CollectionReference<DocumentData>,
    boardColumns: BoardColumn[]
  ) => {
    if (columnsColRef == null || boardColumns.length === 0)
      return [
        {
          tasksColRef: null,
          tasks: [] as Task[]
        }
      ]

    return await Promise.all(
      boardColumns.map(async ({ columnID }) => {
        const tasksColRef = collection(
          db,
          `${columnsColRef.path}/${columnID}/tasks`
        )

        try {
          const taskDocs = await getDocs(tasksColRef)

          if (taskDocs == null) throw new Error()

          if (taskDocs.docs.length === 0)
            return {
              tasksColRef,
              tasks: [] as Task[]
            }

          const tasks = taskDocs.docs.map((taskDoc) => ({
            ...(taskDoc.data() as Omit<Task, 'taskID'>),
            taskID: taskDoc.id
          }))

          return { tasksColRef, tasks }
        } catch (err) {
          return {
            tasksColRef,
            tasks: [] as Task[]
          }
        }
      })
    )
  }

  const getSubtasks = async (
    tasksColRefs: (null | CollectionReference<DocumentData>)[],
    tasks: Task[][]
  ) => {
    return await Promise.all(
      tasks.map(async (taskArr, index) => {
        const taskColRef = tasksColRefs[index]

        if (taskColRef == null) {
          return [[]] as Subtask[][]
        }

        return await Promise.all(
          taskArr.map(async ({ taskID }) => {
            const subtasksColRef = collection(
              db,
              `${taskColRef.path}/${taskID}/subtasks`
            )

            try {
              const subtaskDocs = await getDocs(subtasksColRef)

              if (subtaskDocs == null) throw new Error()

              if (subtaskDocs.docs.length === 0) return [] as Subtask[]

              return subtaskDocs.docs.map((subtaskDoc) => ({
                ...(subtaskDoc.data() as Omit<Subtask, 'subtaskID'>),
                subtaskID: subtaskDoc.id
              }))
            } catch (err) {
              return [] as Subtask[]
            }
          })
        )
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

    let indexOfClickedTask: null | number = null

    if (columnOfClickedTask.value != null) {
      indexOfClickedTask = tasks.value[columnOfClickedTask.value].findIndex(
        ({ taskID }) => taskID === clickedTask.value?.taskID
      )
    }

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

    if (
      columnOfClickedTask.value != null &&
      indexOfClickedTask != null &&
      (!isTaskNameSame || !isDescriptionSame)
    ) {
      tasks.value[columnOfClickedTask.value][indexOfClickedTask] = {
        ...tasks.value[columnOfClickedTask.value][indexOfClickedTask],
        title: formData.name,
        description: formData.description as string
      }
    }

    const newSubtasks = formData.items.filter(({ id }) => {
      if (
        subtasksOfClickedTask.value.length > 0 &&
        subtasksOfClickedTask.value.some(({ subtaskID }) => subtaskID === id)
      )
        return false

      return true
    })

    if (subtasksOfClickedTask.value.length > 0) {
      await Promise.all(
        subtasksOfClickedTask.value.map(async ({ subtaskID, title }, index) => {
          const subtaskDocRef = doc(subtasksColRef, subtaskID)

          const respectiveSubtask = formData.items.find(
            ({ id }) => id === subtaskID
          )
          const isSubtaskNameSame =
            respectiveSubtask != null && respectiveSubtask.name === title

          if (respectiveSubtask != null && isSubtaskNameSame) return

          if (respectiveSubtask == null) {
            try {
              await deleteDoc(subtaskDocRef)
            } catch (err) {
              return (err as FirestoreError).code
            }
          }

          if (
            columnOfClickedTask.value != null &&
            indexOfClickedTask != null &&
            respectiveSubtask == null
          ) {
            subtasks.value[columnOfClickedTask.value][indexOfClickedTask] =
              subtasks.value[columnOfClickedTask.value][
                indexOfClickedTask
              ].filter(({ subtaskID }) =>
                formData.items.find(({ id }) => subtaskID === id)
              )
          }

          if (!isSubtaskNameSame && respectiveSubtask != null) {
            try {
              await updateDoc(subtaskDocRef, {
                title: respectiveSubtask.name
              })
            } catch (err) {
              return (err as FirestoreError).code
            }
          }

          if (
            columnOfClickedTask.value != null &&
            indexOfClickedTask != null &&
            respectiveSubtask != null &&
            !isSubtaskNameSame
          ) {
            const indexOfSubtask = subtasks.value[columnOfClickedTask.value][
              indexOfClickedTask
            ].findIndex(({ subtaskID }) => subtaskID === subtaskDocRef.id)

            subtasks.value[columnOfClickedTask.value][indexOfClickedTask][
              indexOfSubtask
            ] = {
              ...subtasks.value[columnOfClickedTask.value][indexOfClickedTask][
                indexOfSubtask
              ],
              title: formData.items[index].name
            }
          }
        })
      )
    }

    if (newSubtasks.length > 0) {
      await Promise.all(
        newSubtasks.map(async ({ name }) => {
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
      )

      if (columnOfClickedTask.value != null && indexOfClickedTask != null) {
        subtasks.value[columnOfClickedTask.value][indexOfClickedTask] = [
          ...subtasks.value[columnOfClickedTask.value][indexOfClickedTask],
          ...newSubtasks.map(({ name }) => ({
            title: name,
            isCompleted: false
          }))
        ]
      }
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
    getSubtasks,
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

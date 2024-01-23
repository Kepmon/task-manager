import type { Board, BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type { FormDataProperties } from '../api/formsTypes'
import { defineStore } from 'pinia'
import {
  query,
  orderBy,
  getDocs,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useUserStore } from './user'
import { useFormsStore } from './forms'
import {
  returnSubtasksOfGivenTask,
  returnRespectiveSubtaskIndex
} from '../composables/subtasksOfGivenTask'
import {
  checkWhetherFormDataWasChanged,
  returnNeededVars
} from './helpers/tasksHelpers'
import { returnColumnsColRef } from './helpers/boardHelpers'
import { returnPartsOfUserData } from './helpers/userHelpers'
import { nanoid } from 'nanoid'

export const useTasksStore = defineStore('tasks', () => {
  const userStore = useUserStore()

  const getTasks = async (
    boardColumns: BoardColumn[],
    currentBoard: null | undefined | Board
  ) => {
    if (boardColumns.length === 0 || currentBoard == null)
      return [[]] as Task[][]

    const columnsColRef = returnColumnsColRef(
      currentBoard.boardID
    ).columnsColRef

    return await Promise.all(
      boardColumns.map(async ({ columnID }) => {
        const tasksColRef = collection(
          db,
          `${columnsColRef.path}/${columnID}/tasks`
        )
        const tasksColRefOrdered = query(
          tasksColRef,
          orderBy('taskIndex', 'asc')
        )

        try {
          const taskDocs = (await getDocs(tasksColRefOrdered)).docs

          if (taskDocs.length === 0) return [] as Task[]

          const tasks = taskDocs.map((taskDoc) => ({
            ...(taskDoc.data() as Omit<Task, 'taskID'>),
            taskID: taskDoc.id
          }))

          return tasks
        } catch (err) {
          return [] as Task[]
        }
      })
    )
  }

  const getSubtasks = async (
    tasks: Task[][],
    currentBoard: null | undefined | Board,
    boardColumns: BoardColumn[]
  ) => {
    if (currentBoard == null || boardColumns.length === 0) {
      return [[]] as Subtask[][]
    }

    const subtasks = await Promise.all(
      tasks.map(async (taskArr, index) => {
        const columnsColRef = returnColumnsColRef(
          currentBoard.boardID
        ).columnsColRef

        const tasksColRef = collection(
          db,
          `${columnsColRef.path}/${boardColumns[index].columnID}/tasks`
        )

        if (tasksColRef == null) {
          return [[]] as Subtask[][]
        }

        return await Promise.all(
          taskArr.map(async ({ taskID }) => {
            const subtasksColRef = collection(
              db,
              `${tasksColRef.path}/${taskID}/subtasks`
            )
            const subtasksColRefOrdered = query(
              subtasksColRef,
              orderBy('createdAt', 'asc')
            )

            try {
              const subtaskDocs = await getDocs(subtasksColRefOrdered)

              if (subtaskDocs.docs.length === 0) return [] as Subtask[]

              return subtaskDocs.docs.map((subtaskDoc) => ({
                ...(subtaskDoc.data() as Omit<Subtask, 'subtaskID'>),
                subtaskID: subtaskDoc.id,
                taskID
              }))
            } catch (err) {
              return [] as Subtask[]
            }
          })
        )
      })
    )

    return subtasks.flat()
  }

  const addNewTask = async (columnID: BoardColumn['columnID']) => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.task.add.data
    const {
      fullBoards,
      currentBoard,
      boardColumns,
      boardTasks,
      boardSubtasks
    } = returnPartsOfUserData()

    const columnsColRef = returnColumnsColRef().columnsColRef
    const tasksColRef = collection(
      db,
      `${columnsColRef.path}/${columnID}/tasks`
    )

    const columnIndex = boardColumns.findIndex(
      ({ columnID: id }) => id === columnID
    )

    const newTask = {
      createdAt: serverTimestamp(),
      taskID: nanoid(),
      taskIndex: boardTasks[columnIndex]?.length + 1 || 0,
      title: formData.name,
      description: formData.description as string
    }

    try {
      await setDoc(doc(tasksColRef, newTask.taskID), newTask)

      const subtasksColRef = collection(
        db,
        `${tasksColRef.path}/${newTask.taskID}/subtasks`
      )

      const newSubtasks = await Promise.all(
        formData.items.map(async ({ id, name }) => {
          const newSubtask = {
            createdAt: serverTimestamp(),
            subtaskID: id,
            taskID: newTask.taskID,
            title: name,
            isCompleted: false
          }

          await setDoc(doc(subtasksColRef, newSubtask.subtaskID), newSubtask)

          return newSubtask
        })
      )

      if (newSubtasks.some((subtask) => !subtask)) throw new Error()

      boardTasks[columnIndex] =
        boardTasks[columnIndex] == null
          ? [newTask]
          : [...boardTasks[columnIndex], newTask]
      userStore.userData.currentBoard.boardSubtasks = [
        ...boardSubtasks,
        newSubtasks
      ]

      const indexOfRespectiveFullBoard = fullBoards.findIndex(
        ({ boardID }) => boardID === currentBoard.boardID
      )

      if (indexOfRespectiveFullBoard != null) {
        userStore.userData.fullBoards[
          indexOfRespectiveFullBoard
        ].boardSubtasks = [...boardSubtasks, newSubtasks]
      }

      userStore.saveUserData()

      return true
    } catch (err) {
      return false
    }
  }

  const setNewIndexesForTheSameColumn = (
    indexOfColumn: number,
    oldIndex: number,
    newIndex: number
  ) => {
    const { boardTasks } = returnPartsOfUserData()
    const columnTasks = [...boardTasks[indexOfColumn]].toSorted(
      (task1, task2) => task1.taskIndex - task2.taskIndex
    )

    const taskModifications = {
      before: {
        true: columnTasks.slice(0, newIndex),
        false: [
          ...columnTasks.slice(0, oldIndex),
          ...columnTasks.slice(oldIndex + 1, newIndex + 1)
        ]
      },
      after: {
        true: [
          ...columnTasks.slice(0, oldIndex).slice(newIndex),
          ...columnTasks.slice(oldIndex + 1)
        ],
        false: columnTasks.slice(newIndex + 1)
      }
    }

    const tasksBefore = taskModifications.before[`${oldIndex > newIndex}`].map(
      (task, index) => ({
        ...task,
        taskIndex: index
      })
    )
    const draggedTask = {
      ...columnTasks[oldIndex],
      taskIndex: newIndex
    }
    const tasksAfter = taskModifications.after[`${oldIndex > newIndex}`].map(
      (task, index) => ({
        ...task,
        taskIndex:
          taskModifications.before[`${oldIndex > newIndex}`].length + 1 + index
      })
    )

    boardTasks[indexOfColumn] = [...tasksBefore, draggedTask, ...tasksAfter]

    userStore.saveUserData()

    return boardTasks[indexOfColumn].map(({ taskID, taskIndex }) => ({
      taskID,
      taskIndex
    }))
  }

  const setNewIndexesForDifferentColumns = async (
    indexOfNewColumn: number,
    indexOfOldColumn: number,
    newColumnID: BoardColumn['columnID'],
    newIndex: number,
    oldIndex: number
  ) => {
    const { boardTasks } = returnPartsOfUserData()
    const columnsColRef = returnColumnsColRef().columnsColRef

    const newTasksColRef = collection(
      db,
      `${columnsColRef.path}/${newColumnID}/tasks`
    )
    const tasksForOldColumn = [...boardTasks[indexOfOldColumn]]
    const tasksForNewColumn = [...boardTasks[indexOfNewColumn]]

    const newTasksBefore = [...boardTasks[indexOfNewColumn]].slice(0, newIndex)
    const newTasksAfter = [...boardTasks[indexOfNewColumn]].slice(newIndex + 1)
    const movedTask =
      tasksForOldColumn[oldIndex] ||
      tasksForNewColumn[newIndex] ||
      tasksForOldColumn[newIndex]

    await Promise.all(
      [...newTasksBefore, movedTask, ...newTasksAfter].map(
        async ({ taskID }, index) => {
          const taskDocRef = doc(newTasksColRef, taskID)

          await updateDoc(taskDocRef, {
            taskIndex: index + 1
          })
        }
      )
    )
  }

  const addIndexesToTasks = async (
    taskIndexes: { taskID: Task['taskID']; taskIndex: number }[],
    columnID: BoardColumn['columnID']
  ) => {
    const columnsColRef = returnColumnsColRef().columnsColRef
    const nextTasksColRef = collection(
      db,
      `${columnsColRef.path}/${columnID}/tasks`
    )

    taskIndexes.forEach(async ({ taskID, taskIndex }) => {
      const taskDocRef = doc(nextTasksColRef, taskID)

      await updateDoc(taskDocRef, { taskIndex })
    })
  }

  const moveTaskWithinTheSameColumn = async (
    columnID: string,
    indexOfColumn: number,
    oldIndex: number,
    newIndex: number
  ) => {
    try {
      const taskIndexes = setNewIndexesForTheSameColumn(
        indexOfColumn,
        oldIndex,
        newIndex
      )
      await addIndexesToTasks(taskIndexes, columnID)

      return true
    } catch (err) {
      return false
    }
  }

  const moveTaskBetweenColumns = async (
    indexOfOldColumn: number,
    indexOfNewColumn: number,
    taskToBeDragged: Task,
    newIndex: number,
    oldIndex: number
  ) => {
    const { boardColumns, boardTasks } = returnPartsOfUserData()
    const columnsColRef = returnColumnsColRef().columnsColRef

    const subtasksOfMovedTask =
      returnSubtasksOfGivenTask(taskToBeDragged.taskID) || []
    const oldColumnID = boardColumns.find(
      (_, index) => index === indexOfOldColumn
    )?.columnID
    const newColumnID = boardColumns.find(
      (_, index) => index === indexOfNewColumn
    )?.columnID

    if (oldColumnID == null || newColumnID == null) return false

    const oldTasksColRef = collection(
      db,
      `${columnsColRef.path}/${oldColumnID}/tasks`
    )
    const oldTaskDocRef = doc(oldTasksColRef, taskToBeDragged.taskID)
    const oldSubtasksColRef = collection(db, `${oldTaskDocRef.path}/subtasks`)

    const newTasksColRef = collection(
      db,
      `${columnsColRef.path}/${newColumnID}/tasks`
    )
    const newTaskDocRef = doc(newTasksColRef, taskToBeDragged.taskID)
    const newSubtasksColRef = collection(db, `${newTaskDocRef.path}/subtasks`)

    try {
      await deleteTask(taskToBeDragged.taskID, oldColumnID, true)
      await setDoc(newTaskDocRef, {
        taskID: newTaskDocRef.id,
        taskIndex: newIndex + 1,
        createdAt: taskToBeDragged.createdAt,
        title: taskToBeDragged.title,
        description: taskToBeDragged.description
      })
      await setNewIndexesForDifferentColumns(
        indexOfNewColumn,
        indexOfOldColumn,
        newColumnID,
        newIndex,
        oldIndex
      )
    } catch (err) {
      return false
    }

    boardTasks[indexOfOldColumn] = boardTasks[indexOfOldColumn].filter(
      ({ taskID }) => taskID !== taskToBeDragged.taskID
    )
    boardTasks[indexOfNewColumn] = [
      ...boardTasks[indexOfNewColumn],
      taskToBeDragged
    ]

    if (subtasksOfMovedTask.length > 0) {
      const responses = await Promise.all(
        subtasksOfMovedTask.map(async (subtask) => {
          const oldSubtaskDocRef = doc(oldSubtasksColRef, subtask.subtaskID)
          const newSubtaskDocRef = doc(newSubtasksColRef, subtask.subtaskID)

          try {
            await deleteDoc(oldSubtaskDocRef)

            await setDoc(newSubtaskDocRef, {
              title: subtask.title,
              isCompleted: subtask.isCompleted,
              createdAt: subtask.createdAt
            })

            return true
          } catch (err) {
            return false
          }
        })
      )

      if (responses.some((response) => !response)) return false
    }

    userStore.saveUserData()

    return true
  }

  const editTask = async (
    nextColumnID: BoardColumn['columnID'],
    isStatusChanged: boolean
  ) => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.task.edit.data

    const { boardColumns, boardTasks } = returnPartsOfUserData()
    const {
      indexOfColumn,
      indexOfClickedTask,
      taskDocRef,
      subtasksToBeEdited
    } = returnNeededVars()

    if (indexOfColumn == null || subtasksToBeEdited == null) return false

    const { wasFormEvenEdited, isTaskNameSame, isDescriptionSame } =
      checkWhetherFormDataWasChanged(
        formData,
        subtasksToBeEdited,
        isStatusChanged
      )

    if (!wasFormEvenEdited && !isStatusChanged) return true

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
      return false
    }

    if (
      (!isTaskNameSame || !isDescriptionSame) &&
      formData.description != null
    ) {
      boardTasks[indexOfColumn][indexOfClickedTask] = {
        ...boardTasks[indexOfColumn][indexOfClickedTask],
        title: formData.name,
        description: formData.description
      }
    }

    const newSubtasksBaseData = formData.items.filter(
      ({ id }) => !subtasksToBeEdited.some(({ subtaskID }) => subtaskID === id)
    )
    const newSubtasks = newSubtasksBaseData.map(({ id, name }) => ({
      subtaskID: id,
      taskID: taskDocRef.id,
      title: name
    }))
    const subtasksToBeDeleted = subtasksToBeEdited.filter(
      ({ subtaskID }) => !formData.items.some(({ id }) => id === subtaskID)
    )
    const movedTask = boardTasks[indexOfColumn][indexOfClickedTask]

    try {
      const editSubtaskResponse = await editSubtask(
        newSubtasks,
        formData.items,
        subtasksToBeDeleted
      )

      if (!editSubtaskResponse) throw new Error()

      if (isStatusChanged && movedTask != null) {
        const nextColumnIndex = boardColumns.findIndex(
          ({ columnID }) => columnID === nextColumnID
        )

        await moveTaskBetweenColumns(
          indexOfColumn,
          nextColumnIndex,
          movedTask,
          boardTasks[nextColumnIndex].length,
          movedTask.taskIndex - 1
        )
      }
    } catch (err) {
      return false
    }

    handleEditTaskUIChanges(newSubtasks, subtasksToBeDeleted)

    return true
  }

  const editSubtask = async (
    newSubtasks: Omit<Subtask, 'createdAt' | 'isCompleted'>[],
    formDataItems: FormDataProperties['items'],
    oldSubtasks: Subtask[]
  ) => {
    const editResponse = await editExistingSubtasks(formDataItems)
    const addResponse = await addNewSubtasks(newSubtasks)
    const deleteResponse = await deletePreviouslyExistingSubtasks(oldSubtasks)

    return editResponse && addResponse && deleteResponse
  }

  const addNewSubtasks = async (
    newSubtasks: Omit<Subtask, 'createdAt' | 'isCompleted'>[]
  ) => {
    const { indexOfClickedTask, subtasksColRef } = returnNeededVars()

    if (newSubtasks.length === 0) return true
    if (subtasksColRef == null || indexOfClickedTask == null) return false

    const responses = await Promise.all(
      newSubtasks.map(async ({ subtaskID, taskID, title }) => {
        const subtaskDocRef = doc(subtasksColRef, subtaskID)

        try {
          await setDoc(subtaskDocRef, {
            taskID,
            title,
            isCompleted: false,
            createdAt: serverTimestamp()
          })

          return true
        } catch (err) {
          return false
        }
      })
    )

    return responses.every(() => true)
  }

  const editExistingSubtasks = async (
    formDataItems: FormDataProperties['items']
  ) => {
    const { boardSubtasks } = returnPartsOfUserData()
    const {
      taskDocRef,
      indexOfClickedTask,
      subtasksToBeEdited,
      subtasksColRef
    } = returnNeededVars()

    if (boardSubtasks.length === 0 || subtasksToBeEdited == null) return true

    const responses = await Promise.all(
      subtasksToBeEdited.map(async ({ subtaskID, title }, subtaskIndex) => {
        const subtaskDocRef = doc(subtasksColRef, subtaskID)

        const respectiveSubtask = formDataItems.find(
          ({ id }) => id === subtaskID
        )
        const isSubtaskNameSame = respectiveSubtask?.name === title

        if (indexOfClickedTask == null) return false
        if (respectiveSubtask == null || isSubtaskNameSame) return true

        if (!isSubtaskNameSame) {
          try {
            await updateDoc(subtaskDocRef, {
              title: respectiveSubtask.name
            })
          } catch (err) {
            return false
          }

          const respectiveSubtasksIndex = returnRespectiveSubtaskIndex(
            taskDocRef.id
          )

          userStore.userData.currentBoard.boardSubtasks[
            respectiveSubtasksIndex
          ][subtaskIndex].title = respectiveSubtask.name
        }

        return true
      })
    )

    if (responses.some((response) => !response)) return false

    userStore.saveUserData(true)
    return true
  }

  const deletePreviouslyExistingSubtasks = async (oldSubtasks: Subtask[]) => {
    const { subtasksColRef } = returnNeededVars()
    const { clickedTask, columnOfClickedTask } = returnPartsOfUserData()

    if (
      subtasksColRef == null ||
      columnOfClickedTask == null ||
      clickedTask == null
    )
      return false

    const responses = await Promise.all(
      oldSubtasks.map(async ({ subtaskID }) => {
        const subtaskDocRef = doc(subtasksColRef, subtaskID)

        try {
          await deleteDoc(subtaskDocRef)
          return true
        } catch (err) {
          return false
        }
      })
    )

    return responses.every(() => true)
  }

  const handleEditTaskUIChanges = (
    newSubtasks: Omit<Subtask, 'createdAt' | 'isCompleted'>[],
    subtasksToBeDeleted: Subtask[]
  ) => {
    const { boardSubtasks } = returnPartsOfUserData()
    const { indexOfColumn, indexOfClickedTask, taskDocRef } = returnNeededVars()

    if (indexOfColumn == null || indexOfClickedTask == null) return

    userStore.userData.currentBoard.clickedTask = null
    const respectiveSubtasksIndex = returnRespectiveSubtaskIndex(taskDocRef.id)

    if (subtasksToBeDeleted.length > 0) {
      userStore.userData.currentBoard.boardSubtasks[respectiveSubtasksIndex] =
        boardSubtasks[respectiveSubtasksIndex].filter(
          ({ subtaskID: id }) =>
            !subtasksToBeDeleted.some(({ subtaskID }) => id === subtaskID)
        )
    }

    if (newSubtasks.length > 0) {
      const addedSubtasks = newSubtasks.map(({ subtaskID, taskID, title }) => ({
        subtaskID,
        taskID,
        createdAt: new Date().toString(),
        title,
        isCompleted: false
      }))

      userStore.userData.currentBoard.boardSubtasks[respectiveSubtasksIndex] = [
        ...userStore.userData.currentBoard.boardSubtasks[
          respectiveSubtasksIndex
        ],
        ...addedSubtasks
      ]
    }

    userStore.saveUserData()
  }

  const deleteTask = async (
    taskID?: Task['taskID'],
    columnID?: BoardColumn['columnID'],
    isTaskMoved?: true
  ) => {
    const columnsColRef = returnColumnsColRef().columnsColRef
    const {
      boardColumns,
      boardTasks,
      clickedTask,
      columnOfClickedTask,
      boardSubtasks
    } = returnPartsOfUserData()

    const indexOfColumn =
      columnID != null
        ? boardColumns.findIndex(({ columnID: id }) => id === columnID)
        : columnOfClickedTask
    const deletedTaskID = taskID || clickedTask?.taskID

    if (deletedTaskID == null || indexOfColumn == null) return false

    const columnOfDeletedTaskID =
      columnID || boardColumns[indexOfColumn].columnID

    const tasksColRef = collection(
      db,
      `${columnsColRef.path}/${columnOfDeletedTaskID}/tasks`
    )
    const tasksDocRef = doc(tasksColRef, deletedTaskID)

    try {
      await deleteSubtasks(deletedTaskID, columnOfDeletedTaskID)
      await deleteDoc(tasksDocRef)
    } catch (err) {
      return false
    }

    if (isTaskMoved == null) {
      const indexOfDeletedTask = boardTasks[indexOfColumn].findIndex(
        ({ taskID: id }) => id === deletedTaskID
      )

      boardSubtasks[indexOfColumn] = boardSubtasks[indexOfColumn].filter(
        (_, index) => index !== indexOfDeletedTask
      )
      boardTasks[indexOfColumn] = boardTasks[indexOfColumn].filter(
        ({ taskID }) => taskID !== deletedTaskID
      )
      userStore.saveUserData()
    }

    return true
  }

  const deleteSubtasks = async (
    taskID: Task['taskID'],
    columnID: BoardColumn['columnID']
  ) => {
    const columnsColRef = returnColumnsColRef().columnsColRef

    const subtasksColRef = collection(
      db,
      `${columnsColRef.path}/${columnID}/tasks/${taskID}/subtasks`
    )

    try {
      const subtasksDocRefs = (await getDocs(subtasksColRef)).docs
      subtasksDocRefs.forEach(async (subtasksDocRef) => {
        await deleteDoc(subtasksDocRef.ref)
      })

      return true
    } catch (err) {
      return false
    }
  }

  const toggleSubtask = async ({ subtaskID, isCompleted }: Subtask) => {
    const {
      boardColumns,
      clickedTask,
      columnOfClickedTask,
      subtasksOfClickedTask
    } = returnPartsOfUserData()

    if (columnOfClickedTask == null || clickedTask == null) return false

    const columnsColRef = returnColumnsColRef().columnsColRef
    const taskColRef = collection(
      db,
      `${columnsColRef.path}/${boardColumns[columnOfClickedTask].columnID}/tasks`
    )
    const subtasksColRef = collection(
      db,
      `${taskColRef.path}/${clickedTask.taskID}/subtasks`
    )

    try {
      await updateDoc(doc(subtasksColRef, subtaskID), {
        isCompleted: !isCompleted
      })
    } catch (err) {
      return false
    }

    userStore.userData.currentBoard.subtasksOfClickedTask =
      subtasksOfClickedTask.map((subtaskOfClickedTask) => {
        if (subtaskOfClickedTask.subtaskID !== subtaskID)
          return subtaskOfClickedTask

        subtaskOfClickedTask.isCompleted = !subtaskOfClickedTask.isCompleted
        return subtaskOfClickedTask
      })

    userStore.saveUserData()

    return true
  }

  return {
    getTasks,
    getSubtasks,
    addNewTask,
    setNewIndexesForTheSameColumn,
    moveTaskWithinTheSameColumn,
    moveTaskBetweenColumns,
    editTask,
    deleteTask,
    toggleSubtask
  }
})

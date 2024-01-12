import type { Board, BoardColumn, Task, Subtask } from '../api/boardsTypes'
import { defineStore } from 'pinia'
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
import { useFormsStore } from './forms'
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
      return [[[]]] as Subtask[][][]
    }

    return await Promise.all(
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

  const addNewTask = async (columnID: BoardColumn['columnID']) => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.task.add.data
    const { boardColumns, boardTasks, boardSubtasks } = returnPartsOfUserData()

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
      taskIndex: boardTasks[columnIndex].length + 1,
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
            title: name,
            isCompleted: false
          }

          await setDoc(doc(subtasksColRef, newSubtask.subtaskID), newSubtask)

          return newSubtask
        })
      )

      if (newSubtasks.some((subtask) => !subtask)) throw new Error()

      boardTasks[columnIndex] = [...boardTasks[columnIndex], newTask]
      boardSubtasks[columnIndex] = [...boardSubtasks[columnIndex], newSubtasks]

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
    const { boardTasks, boardSubtasks } = returnPartsOfUserData()
    const columnTasks = [...boardTasks[indexOfColumn]].toSorted(
      (task1, task2) => task1.taskIndex - task2.taskIndex
    )
    const columnSubtasks = [...boardSubtasks[indexOfColumn]]

    const modifications = {
      tasks: {
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
      },
      subtasks: {
        before: {
          true: columnSubtasks.slice(0, newIndex),
          false: [
            ...columnSubtasks.slice(0, oldIndex),
            ...columnSubtasks.slice(oldIndex + 1, newIndex + 1)
          ]
        },
        after: {
          true: [
            ...columnSubtasks.slice(0, oldIndex).slice(newIndex),
            ...columnSubtasks.slice(oldIndex + 1)
          ],
          false: columnSubtasks.slice(newIndex + 1)
        }
      }
    }

    const tasksBefore = modifications.tasks.before[
      `${oldIndex > newIndex}`
    ].map((task, index) => ({
      ...task,
      taskIndex: index
    }))
    const draggedTask = {
      ...columnTasks[oldIndex],
      taskIndex: newIndex
    }
    const tasksAfter = modifications.tasks.after[`${oldIndex > newIndex}`].map(
      (task, index) => ({
        ...task,
        taskIndex:
          modifications.tasks.before[`${oldIndex > newIndex}`].length +
          1 +
          index
      })
    )

    boardTasks[indexOfColumn] = [...tasksBefore, draggedTask, ...tasksAfter]
    boardSubtasks[indexOfColumn] = [
      ...modifications.subtasks.before[`${oldIndex > newIndex}`],
      columnSubtasks[oldIndex],
      ...modifications.subtasks.after[`${oldIndex > newIndex}`]
    ]

    userStore.saveUserData()

    return boardTasks[indexOfColumn].map(({ taskID, taskIndex }) => ({
      taskID,
      taskIndex
    }))
  }

  const setNewIndexesForDifferentColumns = (
    indexOfOldColumn: number,
    indexOfNewColumn: number,
    oldIndex: number,
    newIndex: number
  ) => {
    const { boardSubtasks, boardTasks } = returnPartsOfUserData()
    const subtasksForOldColumn = [...boardSubtasks[indexOfOldColumn]]
    const subtasksForNewColumn = [...boardSubtasks[indexOfNewColumn]]
    const tasksForOldColumn = [...boardTasks[indexOfOldColumn]]
    const tasksForNewColumn = [...boardTasks[indexOfNewColumn]]

    const oldSubtasksBefore = subtasksForOldColumn.slice(0, oldIndex)
    const oldSubtasksAfter = subtasksForOldColumn.slice(oldIndex + 1)
    const newSubtasksBefore = subtasksForNewColumn.slice(0, newIndex)
    const newSubtasksAfter = subtasksForNewColumn.slice(newIndex)
    const movedSubtasks = subtasksForOldColumn[oldIndex]

    boardSubtasks[indexOfOldColumn] = [
      ...oldSubtasksBefore,
      ...oldSubtasksAfter
    ]
    boardTasks[indexOfOldColumn] = [...tasksForOldColumn]

    boardSubtasks[indexOfNewColumn] = [
      ...newSubtasksBefore,
      movedSubtasks,
      ...newSubtasksAfter
    ]
    boardTasks[indexOfNewColumn] = [...tasksForNewColumn]

    userStore.saveUserData()

    return {
      oldColumnTasks: boardTasks[indexOfOldColumn].map(
        ({ taskID, taskIndex }) => ({
          taskID,
          taskIndex
        })
      ),
      newColumnTasks: boardTasks[indexOfNewColumn].map(
        ({ taskID, taskIndex }) => ({
          taskID,
          taskIndex
        })
      )
    }
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

    taskIndexes.forEach(async (task) => {
      const taskDocRef = doc(nextTasksColRef, task.taskID)
      const taskIndex = taskIndexes.find(
        (task) => task.taskID === taskDocRef.id
      )?.taskIndex

      if (taskIndex != null) {
        await updateDoc(taskDocRef, { taskIndex })
      }
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
    oldIndex: number,
    newIndex: number,
    taskToBeDragged: Task
  ) => {
    const { boardColumns, boardTasks, boardSubtasks } = returnPartsOfUserData()
    const columnsColRef = returnColumnsColRef().columnsColRef

    const { oldColumnTasks, newColumnTasks } = setNewIndexesForDifferentColumns(
      indexOfOldColumn,
      indexOfNewColumn,
      oldIndex,
      newIndex
    )

    const subtasksOfMovedTask = boardSubtasks[indexOfNewColumn][newIndex]
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
    const oldTaskDocRef = doc(
      oldTasksColRef,
      boardTasks[indexOfNewColumn][newIndex].taskID
    )
    const oldSubtasksColRef = collection(db, `${oldTaskDocRef.path}/subtasks`)

    const newTasksColRef = collection(
      db,
      `${columnsColRef.path}/${newColumnID}/tasks`
    )
    const newTaskDocRef = doc(
      newTasksColRef,
      boardTasks[indexOfNewColumn][newIndex].taskID
    )
    const newSubtasksColRef = collection(db, `${newTaskDocRef.path}/subtasks`)

    try {
      const deleteResponse = await deleteTask(
        taskToBeDragged.taskID,
        oldColumnID
      )
      await setDoc(newTaskDocRef, {
        taskID: newTaskDocRef.id,
        taskIndex: newIndex,
        createdAt: taskToBeDragged.createdAt,
        title: taskToBeDragged.title,
        description: taskToBeDragged.description
      })

      if (deleteResponse === false) throw new Error()

      await addIndexesToTasks(oldColumnTasks, oldColumnID)
      await addIndexesToTasks(newColumnTasks, newColumnID)
    } catch (err) {
      return false
    }

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
          } catch (err) {
            return false
          }
        })
      )

      if (responses.some((response) => response === false)) return false
    }

    userStore.userData.currentBoard.columnOfClickedTask = indexOfNewColumn
    return true
  }

  const editTask = async (
    nextColumnID: BoardColumn['columnID'],
    isStatusChanged: boolean
  ) => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.task.edit.data

    const {
      boardColumns,
      boardTasks,
      boardSubtasks,
      clickedTask,
      columnOfClickedTask
    } = returnPartsOfUserData()

    const indexOfColumn = columnOfClickedTask as number
    const indexOfClickedTask = boardTasks[indexOfColumn].findIndex(
      ({ taskID }) => taskID === clickedTask?.taskID
    )
    const columnOfEditedTask = boardColumns[columnOfClickedTask as number]
    const subtasksToBeEdited = boardSubtasks[indexOfColumn][indexOfClickedTask]

    const columnsColRef = returnColumnsColRef().columnsColRef
    const columnDocRef = doc(columnsColRef, columnOfEditedTask.columnID)
    const tasksColRef = collection(db, `${columnDocRef.path}/tasks`)
    const taskDocRef = doc(tasksColRef, clickedTask?.taskID)
    const subtasksColRef = collection(db, `${taskDocRef.path}/subtasks`)

    const isTaskNameSame = formData.name === clickedTask?.title
    const isDescriptionSame = formData.description === clickedTask?.description
    const isNumberOfSubtaskSame =
      subtasksToBeEdited.length === formData.items.length
    const areSubtasksTitlesSame = subtasksToBeEdited.every(
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
      return false
    }

    if (!isTaskNameSame || !isDescriptionSame) {
      boardTasks[indexOfColumn][indexOfClickedTask] = {
        ...boardTasks[indexOfColumn][indexOfClickedTask],
        title: formData.name,
        description: formData.description as string
      }
    }

    const newSubtasks = formData.items.filter(({ id }) => {
      if (
        subtasksToBeEdited.length > 0 &&
        subtasksToBeEdited.some(({ subtaskID }) => subtaskID === id)
      )
        return false

      return true
    })

    if (boardSubtasks.length > 0) {
      await Promise.all(
        subtasksToBeEdited.map(async ({ subtaskID, title }, index) => {
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
              return false
            }
          }

          if (indexOfClickedTask != null && respectiveSubtask == null) {
            boardSubtasks[indexOfColumn][indexOfClickedTask] =
              subtasksToBeEdited.filter(({ subtaskID }) =>
                formData.items.find(({ id }) => subtaskID === id)
              )
          }

          if (!isSubtaskNameSame && respectiveSubtask != null) {
            try {
              await updateDoc(subtaskDocRef, {
                title: respectiveSubtask.name
              })
            } catch (err) {
              return false
            }
          }

          if (
            indexOfClickedTask != null &&
            respectiveSubtask != null &&
            !isSubtaskNameSame
          ) {
            const indexOfSubtask = subtasksToBeEdited.findIndex(
              ({ subtaskID }) => subtaskID === subtaskDocRef.id
            )

            boardSubtasks[indexOfColumn][indexOfClickedTask][indexOfSubtask] = {
              ...subtasksToBeEdited[indexOfSubtask],
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

            if (response == null) throw new Error()
          } catch (err) {
            return false
          }
        })
      )

      if (indexOfClickedTask != null) {
        boardSubtasks[indexOfColumn][indexOfClickedTask] = [
          ...subtasksToBeEdited,
          ...newSubtasks.map(({ id, name }) => ({
            subtaskID: id,
            createdAt: new Date().toString(),
            title: name,
            isCompleted: false
          }))
        ]
      }
    }

    try {
      if (isStatusChanged) {
        const response = await moveTaskBetweenColumns(nextColumnID)

        if (response === false) throw new Error()
      }
    } catch (err) {
      return false
    }

    userStore.userData.currentBoard.clickedTask = null

    return true
  }

  const deleteTask = async (
    taskID?: Task['taskID'],
    columnID?: BoardColumn['columnID']
  ) => {
    const columnsColRef = returnColumnsColRef().columnsColRef
    const { boardColumns, boardTasks, clickedTask, columnOfClickedTask } =
      returnPartsOfUserData()

    const indexOfColumn =
      columnID != null
        ? boardColumns.findIndex(({ columnID: id }) => id === columnID)
        : columnOfClickedTask
    const deletedTaskID = taskID != null ? taskID : clickedTask?.taskID

    if (deletedTaskID == null || indexOfColumn == null) return false

    const columnOfDeletedTaskID =
      columnID != null ? columnID : boardColumns[indexOfColumn].columnID

    const tasksColRef = collection(
      db,
      `${columnsColRef.path}/${columnOfDeletedTaskID}/tasks`
    )
    const tasksDocRef = doc(tasksColRef, deletedTaskID)

    try {
      await deleteSubtasks(deletedTaskID, columnOfDeletedTaskID, indexOfColumn)
      await deleteDoc(tasksDocRef)

      boardTasks[indexOfColumn] = boardTasks[indexOfColumn].filter(
        ({ taskID }) => taskID !== deletedTaskID
      )
      userStore.userData.currentBoard.clickedTask = null
      userStore.saveUserData()

      return true
    } catch (err) {
      return false
    }
  }

  const deleteSubtasks = async (
    taskID: Task['taskID'],
    columnID: BoardColumn['columnID'],
    columnOfClickedTask: number
  ) => {
    const columnsColRef = returnColumnsColRef().columnsColRef
    const { boardTasks, boardSubtasks } = returnPartsOfUserData()

    if (boardSubtasks.length === 0) return

    const subtasksColRef = collection(
      db,
      `${columnsColRef.path}/${columnID}/tasks/${taskID}/subtasks`
    )

    try {
      const subtasksDocRefs = await getDocs(subtasksColRef)
      subtasksDocRefs.forEach(async (subtasksDocRef) => {
        await deleteDoc(subtasksDocRef.ref)
      })

      const indexOfDeletedTask = boardTasks[columnOfClickedTask].findIndex(
        ({ taskID: id }) => id === taskID
      )

      boardSubtasks[columnOfClickedTask] = boardSubtasks[
        columnOfClickedTask
      ].filter((_, index) => index !== indexOfDeletedTask)
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
    setNewIndexesForDifferentColumns,
    moveTaskWithinTheSameColumn,
    moveTaskBetweenColumns,
    editTask,
    deleteTask,
    toggleSubtask
  }
})

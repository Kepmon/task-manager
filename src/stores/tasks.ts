import type { Board, BoardColumn, Task, Subtask } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import {
  query,
  where,
  limit,
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

        try {
          const taskDocs = (await getDocs(tasksColRef)).docs

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

            try {
              const subtaskDocs = await getDocs(subtasksColRef)

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

    const columnsColRef = returnColumnsColRef().columnsColRef
    const tasksColRef = collection(
      db,
      `${columnsColRef.path}/${columnID}/tasks`
    )

    const columnIndex = userStore.userData.currentBoard.boardColumns.findIndex(
      ({ columnID: id }) => id === columnID
    )
    const boardTasks = userStore.userData.currentBoard.boardTasks

    const newTask = {
      createdAt: serverTimestamp(),
      taskID: nanoid(),
      title: formData.name,
      description: formData.description as string
    }

    try {
      const addedDocRef = await addDoc(tasksColRef, newTask)

      const subtasksColRef = collection(db, `${addedDocRef.path}/subtasks`)

      const boardSubtasks = userStore.userData.currentBoard.boardSubtasks
      const newSubtasks = await Promise.all(
        formData.items.map(async ({ id, name }) => {
          const newSubtask = {
            createdAt: serverTimestamp(),
            subtaskID: id,
            title: name,
            isCompleted: false
          }
          try {
            const response = await addDoc(subtasksColRef, newSubtask)

            if (response == null) throw new Error()

            return newSubtask
          } catch (err) {
            return false
          }
        })
      )

      if (newSubtasks.some((subtask) => !subtask)) return false

      userStore.userData.currentBoard.boardTasks[columnIndex] = [
        ...boardTasks[columnIndex],
        newTask
      ]
      userStore.userData.currentBoard.boardSubtasks[columnIndex] = [
        ...boardSubtasks[columnIndex],
        newSubtasks as Subtask[]
      ]

      return true
    } catch (err) {
      return false
    }
  }

  const setNewIndexesForTheSameColumn = (
    indexOfNewColumn: number,
    oldIndex: number,
    newIndex: number
  ) => {
    if (oldIndex === newIndex) return

    const subtasksForNewColumn = [
      ...userStore.userData.currentBoard.subtasksOfClickedTask
    ]

    let subtasksBefore: Subtask[][] = []
    let subtasksAfter: Subtask[][] = []

    if (oldIndex > newIndex) {
      subtasksBefore = [subtasksForNewColumn.slice(0, newIndex)]
      subtasksAfter = [
        [
          ...subtasksForNewColumn.slice(0, oldIndex).slice(newIndex),
          ...subtasksForNewColumn.slice(oldIndex + 1)
        ]
      ]
    }

    if (oldIndex < newIndex) {
      subtasksAfter = [subtasksForNewColumn.slice(newIndex + 1)]
      subtasksBefore = [
        [
          ...subtasksForNewColumn.slice(0, oldIndex),
          ...subtasksForNewColumn.slice(oldIndex + 1, newIndex + 1)
        ]
      ]
    }

    userStore.userData.currentBoard.boardSubtasks[indexOfNewColumn] = [
      ...subtasksBefore,
      subtasksForNewColumn,
      ...subtasksAfter
    ]
  }

  const setNewIndexesForDifferentColumns = (
    indexOfOldColumn: number,
    indexOfNewColumn: number,
    oldIndex: number,
    newIndex: number
  ) => {
    const boardSubtasks = userStore.userData.currentBoard.boardSubtasks
    const subtasksForOldColumn = [...boardSubtasks[indexOfOldColumn]]
    const subtasksForNewColumn = [...boardSubtasks[indexOfNewColumn]]

    const oldSubtasksBefore = subtasksForOldColumn.slice(0, oldIndex)
    const oldSubtasksAfter = subtasksForOldColumn.slice(oldIndex + 1)
    const newSubtasksBefore = subtasksForNewColumn.slice(0, newIndex)
    const newSubtasksAfter = subtasksForNewColumn.slice(newIndex)
    const movedSubtasks = subtasksForOldColumn[oldIndex]

    userStore.userData.currentBoard.boardSubtasks[indexOfOldColumn] = [
      ...oldSubtasksBefore,
      ...oldSubtasksAfter
    ]

    userStore.userData.currentBoard.boardSubtasks[indexOfNewColumn] = [
      ...newSubtasksBefore,
      movedSubtasks,
      ...newSubtasksAfter
    ]
  }

  const addIndexesToTasks = async (
    taskIndexes: { taskID: Task['taskID']; taskIndex: number }[],
    columnID: BoardColumn['columnID']
  ) => {
    const columnsColRef = returnColumnsColRef(
      userStore.userData.currentBoard.boardID
    ).columnsColRef
    const nextTasksColRef = collection(db, `${columnsColRef}/${columnID}/tasks`)

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
    const boardColumns = userStore.userData.currentBoard.boardColumns
    const columnOfClickedTask =
      userStore.userData.currentBoard.columnOfClickedTask
    const columnTasks = userStore.userData.currentBoard.boardTasks
    const columnSubtasks = userStore.userData.currentBoard.boardSubtasks

    if (columnOfClickedTask == null) return

    const clickedColumnID = boardColumns[columnOfClickedTask].columnID
    const prevColumnID =
      previousColumnID != null ? previousColumnID : clickedColumnID
    const columnsColRef = returnColumnsColRef(
      userStore.userData.currentBoard.boardID
    ).columnsColRef

    const prevColumnIndex = boardColumns.findIndex(
      ({ columnID }) => columnID === prevColumnID
    )
    const nextColumnIndex = boardColumns.findIndex(
      ({ columnID }) => columnID === nextColumnID
    )
    const indexOfTaskColumn =
      taskToBeDragged != null ? nextColumnIndex : prevColumnIndex
    const taskIndex =
      columnTasks[indexOfTaskColumn].findIndex(({ taskID }) =>
        taskToBeDragged != null
          ? taskID === taskToBeDragged.taskID
          : taskID === userStore.userData.currentBoard.clickedTask?.taskID
      ) || 0

    const movedTask = columnTasks[indexOfTaskColumn][taskIndex]
    const subtasksOfMovedTask = columnSubtasks[indexOfTaskColumn][taskIndex]

    if (nextColumnID === previousColumnID && taskIndexes != null) {
      addIndexesToTasks(taskIndexes, nextColumnID)
      return
    }

    const nextTasksColRef = collection(
      db,
      `${columnsColRef}/${nextColumnID}/tasks`
    )

    const nextTaskDocRef = doc(
      nextTasksColRef,
      columnTasks[indexOfTaskColumn][taskIndex].taskID
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

      if (!deleteResponse) throw new Error()

      if (taskToBeDragged == null) {
        columnTasks[prevColumnIndex] = columnTasks[prevColumnIndex].filter(
          ({ taskID }) => movedTask.taskID !== taskID
        )
        columnTasks[nextColumnIndex] = [
          ...columnTasks[nextColumnIndex],
          movedTask
        ]
      }
    } catch (err) {
      return false
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
          return false
        }

        if (taskToBeDragged == null) {
          columnSubtasks[prevColumnIndex] = columnSubtasks[
            prevColumnIndex
          ].filter((_, index) => taskIndex != index)

          columnSubtasks[nextColumnIndex] = [
            ...columnSubtasks[nextColumnIndex],
            subtasksOfMovedTask
          ]
        }
      })
    }

    userStore.userData.currentBoard.columnOfClickedTask = nextColumnIndex
    return true
  }

  const editTask = async (
    nextColumnID: BoardColumn['columnID'],
    isStatusChanged: boolean
  ) => {
    const formsStore = useFormsStore()
    const formData = formsStore.formData.task.edit.data

    const boardColumns = userStore.userData.currentBoard.boardColumns
    const boardTasks = userStore.userData.currentBoard.boardTasks

    const indexOfColumn = userStore.userData.currentBoard
      .columnOfClickedTask as number
    const indexOfClickedTask = boardTasks[indexOfColumn].findIndex(
      ({ taskID }) => taskID === clickedTask.taskID
    )
    const columnOfClickedTask =
      boardColumns[
        userStore.userData.currentBoard.columnOfClickedTask as number
      ]
    const clickedTask = userStore.userData.currentBoard.clickedTask as Task
    const boardSubtasks =
      userStore.userData.currentBoard.boardSubtasks[indexOfColumn][
        indexOfClickedTask
      ]

    const columnsColRef = returnColumnsColRef(
      userStore.userData.currentBoard.boardID
    ).columnsColRef
    const columnDocRef = doc(columnsColRef, columnOfClickedTask.columnID)
    const tasksColRef = collection(db, `${columnDocRef.path}/tasks`)
    const taskDocRef = doc(tasksColRef, clickedTask.taskID)
    const subtasksColRef = collection(db, `${taskDocRef.path}/subtasks`)

    const isTaskNameSame = formData.name === clickedTask.title
    const isDescriptionSame = formData.description === clickedTask.description
    const isNumberOfSubtaskSame = boardSubtasks.length === formData.items.length
    const areSubtasksTitlesSame = boardSubtasks.every(({ subtaskID, title }) =>
      formData.items.find(({ name, id }) => title === name && subtaskID === id)
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
      userStore.userData.currentBoard.boardTasks[indexOfColumn][
        indexOfClickedTask
      ] = {
        ...userStore.userData.currentBoard.boardTasks[indexOfColumn][
          indexOfClickedTask
        ],
        title: formData.name,
        description: formData.description as string
      }
    }

    const newSubtasks = formData.items.filter(({ id }) => {
      if (
        boardSubtasks.length > 0 &&
        boardSubtasks.some(({ subtaskID }) => subtaskID === id)
      )
        return false

      return true
    })

    if (boardSubtasks.length > 0) {
      await Promise.all(
        boardSubtasks.map(async ({ subtaskID, title }, index) => {
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
            userStore.userData.currentBoard.boardSubtasks[indexOfColumn][
              indexOfClickedTask
            ] = boardSubtasks.filter(({ subtaskID }) =>
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
            const indexOfSubtask = boardSubtasks.findIndex(
              ({ subtaskID }) => subtaskID === subtaskDocRef.id
            )

            userStore.userData.currentBoard.boardSubtasks[indexOfColumn][
              indexOfClickedTask
            ][indexOfSubtask] = {
              ...boardSubtasks[indexOfSubtask],
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
        userStore.userData.currentBoard.boardSubtasks[indexOfColumn][
          indexOfClickedTask
        ] = [
          ...boardSubtasks,
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
    const columnsColRef = returnColumnsColRef(
      userStore.userData.currentBoard.boardID
    ).columnsColRef
    const boardColumns = userStore.userData.currentBoard.boardColumns

    const deletedTaskID =
      taskID != null
        ? taskID
        : userStore.userData.currentBoard.clickedTask?.taskID
    const columnOfDeletedTaskID =
      columnID != null
        ? columnID
        : boardColumns[
            userStore.userData.currentBoard.columnOfClickedTask as number
          ].columnID

    const tasksColRef = collection(
      db,
      `${columnsColRef}/${columnOfDeletedTaskID}/tasks`
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
            return false
          }
        })
      }

      try {
        await deleteDoc(tasksDocRef)
        return true
      } catch (err) {
        return false
      }
    } catch (err) {
      return false
    }
  }

  const toggleSubtask = async (subtask: Subtask) => {
    const boardColumns = userStore.userData.currentBoard.boardColumns
    const indexOfColumn = userStore.userData.currentBoard.columnOfClickedTask
    const clickedTask = userStore.userData.currentBoard.clickedTask
    const columnsColRef = returnColumnsColRef(
      userStore.userData.currentBoard.boardID
    ).columnsColRef

    const columnColRef = query(
      columnsColRef,
      where('columnID', '==', boardColumns[indexOfColumn || 0].columnID),
      limit(1)
    )
    const columnDocRef = (await getDocs(columnColRef)).docs[0]

    if (indexOfColumn == null || clickedTask == null) return false

    const taskColRef = query(
      collection(db, `${columnsColRef.path}/${columnDocRef.id}/tasks`),
      where('taskID', '==', clickedTask.taskID),
      limit(1)
    )
    const taskDocRef = (await getDocs(taskColRef)).docs[0]
    const subtasksColRef = collection(
      db,
      `${columnsColRef.path}/${columnDocRef.id}/tasks/${taskDocRef.id}/subtasks`
    )
    const subtaskColRef = query(
      collection(db, `${columnsColRef}/${columnDocRef.id}/tasks`),
      where('taskID', '==', clickedTask.taskID),
      limit(1)
    )
    const subtaskDocRef = (await getDocs(subtaskColRef)).docs[0]

    try {
      await updateDoc(doc(subtasksColRef, subtaskDocRef.id), {
        isCompleted: !subtask.isCompleted
      })
    } catch (err) {
      return false
    }

    userStore.userData.currentBoard.subtasksOfClickedTask =
      userStore.userData.currentBoard.subtasksOfClickedTask.map(
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

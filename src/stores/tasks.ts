import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
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

  const getTasksColRefs = async () => {
    const { columnIDs, columnsColRefPath } = await boardsStore.getColumnIDs()

    return columnIDs.map((columnID) =>
      collection(db, `${columnsColRefPath}/${columnID}/tasks`)
    )
  }

  const getSubtasksColRefs = async () => {
    const tasksColRefs = await getTasksColRefs()
    const tasksIDs = await Promise.all(
      tasksColRefs.map(async (tasksColRef) => {
        const tasksDocRefs = (await getDocs(tasksColRef)).docs

        return await Promise.all(
          tasksDocRefs.map((tasksDocRef) => tasksDocRef.id)
        )
      })
    )
    const tasksPaths = tasksColRefs.map((tasksColRef) => tasksColRef.path)

    return tasksIDs.map((taskIDArr, index) =>
      taskIDArr.map((taskID) =>
        collection(db, `${tasksPaths[index]}/${taskID}/subtasks`)
      )
    )
  }

  const getTasks = async () => {
    const tasksColRefs = await getTasksColRefs()
    const tasksColRefsOrdered = tasksColRefs.map((tasksColRef) =>
      query(tasksColRef, orderBy('createdAt', 'asc'))
    )

    tasks.value = await Promise.all(
      tasksColRefsOrdered.map(async (tasksColRef) => {
        const tasksDocRefs = (await getDocs(tasksColRef)).docs

        return tasksDocRefs.map((tasksDocRef) => ({
          ...(tasksDocRef.data() as Omit<Task, 'taskID'>),
          taskID: tasksDocRef.id
        }))
      })
    )
  }

  const getSubtasks = async () => {
    const subtasksColRefs = await getSubtasksColRefs()
    const subtasksColRefsOrdered = subtasksColRefs.map((subtasksColRefArr) =>
      subtasksColRefArr.map((subtasksColRef) =>
        query(subtasksColRef, orderBy('createdAt', 'asc'))
      )
    )

    subtasks.value = await Promise.all(
      subtasksColRefsOrdered.map(async (subtasksColRefArr) =>
        Promise.all(
          subtasksColRefArr.map(async (subtasksColRef) => {
            const subtasksDocRefs = (await getDocs(subtasksColRef)).docs

            return subtasksDocRefs.map((subtasksDocRef) => ({
              ...(subtasksDocRef.data() as Omit<Subtask, 'subtaskID'>),
              subtaskID: subtasksDocRef.id
            }))
          })
        )
      )
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
      const taskID = addedDocRef.id
      const subtasksColRef = collection(
        db,
        `users/${userStore.userID}/boards/${boardsStore.currentBoardID}/columns/${selectedColumn.columnID}/tasks/${taskID}/subtasks`
      )

      await getTasks()

      subtasks.forEach(async (subtask) => {
        await addDoc(subtasksColRef, {
          title: subtask,
          isCompleted: false,
          createdAt: serverTimestamp()
        })
      })

      await getSubtasks()
    }
  }

  return {
    tasks,
    subtasks,
    getTasksColRefs,
    getTasks,
    getSubtasks,
    addNewTask
  }
})

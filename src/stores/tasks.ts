import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Query, DocumentData, updateDoc } from 'firebase/firestore'
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db, usersColRef } from '../firebase'
import { useUserStore } from './user'
import { useBoardsStore } from './boards'

export const useTasksStore = defineStore('tasks', () => {
  const userStore = useUserStore()
  const boardsStore = useBoardsStore()
  const currentBoardID = computed(() => boardsStore.currentBoard?.docID || null)

  const tasks = ref<Task[][]>([])
  const subtasks = ref<Subtask[][]>([])

  const isLoading = ref(true)
  const activeUserDocID = ref('')

  onSnapshot(usersColRef, async () => {
    activeUserDocID.value = (
      await getDocs(userStore.activeUserColRef as Query<DocumentData>)
    ).docs[0].id

    const columnsColRef = collection(
      db,
      `users/${activeUserDocID.value}/boards/${currentBoardID.value}/columns`
    )
    const columnsColRefOrdered = query(
      columnsColRef,
      orderBy('createdAt', 'desc')
    )
    const columnIDs = ref<BoardColumn['docID'][]>([])
    const columnDocs = (await getDocs(columnsColRefOrdered)).docs

    const tasksColRefs = columnDocs.map((columnDoc) => {
      const columnID = columnDoc.data().docID
      return collection(
        db,
        `users/${activeUserDocID.value}/boards/${currentBoardID.value}/columns/${columnID}/tasks`
      )
    })

    onSnapshot(columnsColRefOrdered, async (snapshot) => {
      const tasksColRefs = snapshot.docs.map((snapDoc) => {
        const columnID = snapDoc.data().docID
        columnIDs.value.push(columnID)

        return collection(
          db,
          `users/${activeUserDocID.value}/boards/${currentBoardID.value}/columns/${columnID}/tasks`
        )
      })

      await Promise.all(
        tasksColRefs.map(async (taskRef, taskIndex) => {
          const tasksPerColumnArr = ref<Task[]>([])
          onSnapshot(taskRef, (snapshot) => {
            snapshot.docs.forEach((taskDocRef) => {
              tasksPerColumnArr.value.push(taskDocRef.data() as Task)
            })
            tasks.value.push(tasksPerColumnArr.value)

            const subtasksColRefs = tasks.value[taskIndex].map((task) => {
              const taskID = task.taskID

              return collection(
                db,
                `users/${activeUserDocID.value}/boards/${currentBoardID.value}/columns/${columnIDs.value[taskIndex]}/tasks/${taskID}/subtasks`
              )
            })
          })

          return (await getDocs(taskRef)).docs
        })
      )
    })

    isLoading.value = false
  })

  const addNewTask = async (
    selectedColumn: BoardColumn,
    task: Omit<Task, 'createdAt' | 'taskID'>,
    subtasks: Subtask['title'][]
  ) => {
    const tasksColRef = collection(
      db,
      `users/${activeUserDocID.value}/boards/${currentBoardID.value}/columns/${selectedColumn.docID}/tasks`
    )

    const addedDocRef = await addDoc(tasksColRef, {
      createdAt: serverTimestamp(),
      ...task
    })

    if (addedDocRef) {
      await updateDoc(addedDocRef, {
        taskID: addedDocRef.id
      })
    }

    if (addedDocRef) {
      const taskID = addedDocRef.id
      const subtasksColRef = collection(
        db,
        `users/${activeUserDocID.value}/boards/${currentBoardID.value}/columns/${selectedColumn.docID}/tasks/${taskID}/subtasks`
      )

      subtasks.forEach(async (subtask) => {
        await addDoc(subtasksColRef, {
          title: subtask,
          isCompleted: false,
          createdAt: serverTimestamp()
        })
      })
    }
  }

  return {
    isLoading,
    tasks,
    subtasks,
    addNewTask
  }
})

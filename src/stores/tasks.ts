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
    const columnDocs = (await getDocs(columnsColRefOrdered)).docs

    const columnDocsID = ref<string[]>([])
    const tasksDocsID = ref<string[]>([])
    const tasksColRefs = columnDocs.map((columnDoc) => {
      columnDocsID.value.push(columnDoc.data().docID)

      return collection(
        db,
        `users/${activeUserDocID.value}/boards/${
          currentBoardID.value
        }/columns/${columnDoc.data().docID}/tasks`
      )
    })

    const tasksColRefsOrdered = tasksColRefs.map((tasksColRef) =>
      query(tasksColRef, orderBy('createdAt', 'desc'))
    )
    const tasksDocs = await Promise.all(
      tasksColRefsOrdered.map(async (taskRef) => (await getDocs(taskRef)).docs)
    )

    const subtasksColRefsOrdered = tasksDocs.map((taskDoc) => {
      return taskDoc.map((doc, index) => {
        const subtasksColRef = collection(
          db,
          `users/${activeUserDocID.value}/boards/${
            currentBoardID.value
          }/columns/${columnDocsID.value[index]}/tasks/${
            doc.data().taskID
          }/subtasks`
        )

        return query(subtasksColRef, orderBy('createdAt', 'desc'))
      })
    })

    tasksColRefsOrdered.forEach((tasksColRef) => {
      onSnapshot(tasksColRef, (snapshot) => {
        tasks.value.push(
          snapshot.docs.map((taskDoc) => ({
            ...(taskDoc.data() as Omit<Task, 'taskID'>),
            taskID: taskDoc.id
          }))
        )
      })
    })

    subtasksColRefsOrdered.forEach((subtasksColRef) => {
      onSnapshot(subtasksColRef[0], (snapshot) => {
        const subtasksPerTask = snapshot.docs.map((snap) => ({
          ...(snap.data() as Omit<Subtask, 'subtaskID'>),
          subtaskID: snap.id
        }))

        subtasks.value.push(subtasksPerTask)
      })
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

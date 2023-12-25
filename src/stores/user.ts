import type { UserData, BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type { AuthError, User } from 'firebase/auth'
import type { FirestoreError } from 'firebase/firestore'
import { defineStore } from 'pinia'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { auth, usersColRef, db } from '../firebase'
import { computed, ref } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<null | User>(null)
  const userID = computed(() =>
    currentUser.value != null ? currentUser.value.uid : null
  )
  const inputedPassword = ref<null | string>(null)

  const userData = ref<UserData>({
    allBoards: [],
    fullBoards: [],
    currentBoard: {
      boardID: '',
      boardName: '',
      boardColumns: [] as BoardColumn[],
      columnOfClickedTask: null,
      boardTasks: [[]] as Task[][],
      clickedTask: null,
      boardSubtasks: [[[]]] as Subtask[][][],
      subtasksOfClickedTask: [] as Subtask[]
    }
  })

  const boardsStore = useBoardsStore()
  const tasksStore = useTasksStore()
  const isLoading = ref(true)

  onAuthStateChanged(auth, async (user) => {
    if (user == null) {
      localStorage.removeItem('TM-user')
      currentUser.value = null
      return
    }

    currentUser.value = user
    localStorage.setItem('TM-user', JSON.stringify(user))

    const response = await getUserData()
    userData.value = response

    const savedBoardJSON = localStorage.getItem(
      `TM-currentBoard-${userID.value}`
    )
    if (savedBoardJSON != null) {
      isLoading.value = false
      return
    }

    isLoading.value = false
  })

  const getUserData = async () => {
    const boards = await boardsStore.getBoards()
    const currentBoard = await boardsStore.getCurrentBoard(boards)
    const columnsData = await boardsStore.getColumns(currentBoard)
    const tasksData = await tasksStore.getTasks(
      columnsData.columnsColRef,
      columnsData.boardColumns
    )
    const boardSubtasks = await tasksStore.getSubtasks(
      tasksData.map(({ tasksColRef }) => tasksColRef),
      tasksData.map(({ tasks }) => tasks)
    )

    const currentFullBoard = {
      boardID: currentBoard?.boardID,
      boardName: currentBoard?.name,
      boardColumns: columnsData.boardColumns,
      columnOfClickedTask: null,
      boardTasks: tasksData.map((item) =>
        item.tasks.every((task) => typeof task !== 'string')
      )
        ? tasksData.map((item) => item.tasks)
        : ([[]] as Task[][]),
      clickedTask: null,
      boardSubtasks,
      subtasksOfClickedTask: [] as Subtask[]
    }

    return {
      allBoards: boards,
      fullBoards: [currentFullBoard],
      currentBoard: currentFullBoard
    }
  }

  const register = async (email: string, password: string) => {
    type RegisterError = FirestoreError | AuthError

    try {
      const authResponse = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (authResponse == null) throw new Error()

      try {
        await setDoc(doc(usersColRef, authResponse.user.uid), {})
        await logout()
      } catch (err) {
        return (err as RegisterError | FirestoreError).code
      }

      return true
    } catch (err) {
      return (err as RegisterError).code
    }
  }

  const logIn = async (email: string, password: string) => {
    try {
      const authResponse = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (!authResponse) throw new Error()

      return true
    } catch (err) {
      return (err as AuthError).code
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)

      return true
    } catch (err) {
      return (err as AuthError).code
    }
  }

  const deleteAccount = async () => {
    const user = auth.currentUser

    const credential = EmailAuthProvider.credential(
      (user as User).email as string,
      inputedPassword.value as string
    )

    try {
      await reauthenticateWithCredential(user as User, credential)
    } catch (err) {
      return (err as AuthError).code
    }

    try {
      const boardsColRef = collection(db, `users/${(user as User).uid}/boards`)
      const boardsDocRefs = (await getDocs(boardsColRef)).docs

      if (boardsDocRefs.length > 0) {
        boardsDocRefs.forEach(async (docRef) => {
          const boardDoc = docRef.id

          try {
            const response = await boardsStore.deleteBoard(boardDoc)

            if (response === false) throw new Error()
          } catch (err) {
            return false
          }
        })
      }
      const userDocRef = doc(usersColRef, (user as User).uid)

      try {
        await deleteDoc(userDocRef)
      } catch (err) {
        return false
      }

      try {
        await deleteUser(user as User)
      } catch (err) {
        return false
      }

      return true
    } catch (err) {
      return false
    }
  }

  return {
    isLoading,
    userID,
    userData,
    inputedPassword,
    getUserData,
    register,
    logIn,
    logout,
    deleteAccount
  }
})

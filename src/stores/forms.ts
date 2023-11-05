import type { FormData } from '../api/boardsTypes'
import type { FirestoreErrorCode } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'
import { handleResponse } from '../composables/responseHandler'

export const useFormsStore = defineStore('forms', () => {
  const boardsStore = useBoardsStore()
  const tasksStore = useTasksStore()

  const boardColumns = computed(() =>
    boardsStore.boardColumns.map((boardColumn) => ({
      name: boardColumn.name,
      id: boardColumn.columnID,
      dotColor: boardColumn.dotColor || null
    }))
  )

  const subtasks = computed(() =>
    tasksStore.subtasksOfClickedTask.map((subtask) => ({
      name: subtask.title,
      id: subtask.subtaskID,
      dotColor: undefined
    }))
  )

  const formsData = computed(() => ({
    board: ref({
      add: ref({
        items: ['Todo', 'Doing'].map((item, index) => ({
          name: item,
          id: index.toString(),
          dotColor: 'hsl(193 75% 59%)'
        })),
        placeholderItems: undefined,
        errors: [false, false]
      }),
      edit: ref({
        items: boardColumns.value,
        placeholderItems: undefined,
        errors: boardsStore.boardColumns.map(() => false)
      })
    }),
    task: ref({
      add: ref({
        items: ['', ''].map((item, index) => ({
          name: item,
          id: index.toString(),
          dotColor: undefined
        })),
        placeholderItems: ['e.g. Make coffee', 'e.g. Drink coffee & smile'],
        errors: [false, false]
      }),
      edit: ref({
        items: subtasks.value,
        placeholderItems: undefined,
        errors: tasksStore.subtasks.map(() => false)
      })
    })
  }))

  const isNewInputAdded = ref(false)
  const isFormValid = ref(false)

  const addNewInput = (formData: FormData) => {
    const index = formData.items.length + 1

    formData.items.push({
      name: '',
      id: index.toString()
    })
    formData.errors.push(false)
    isNewInputAdded.value = true
  }

  const removeInput = (formData: FormData, index: number) => {
    formData.items.splice(index, 1)
    formData.errors.splice(index, 1)
  }

  const handleBlur = (formData: FormData, index: number) => {
    if (formData.items[index].name !== '') {
      formData.errors[index] = false
      return
    }

    formData.errors[index] = true
  }

  const checkFormValidity = () => {
    const formInstance = new FormData(
      document.querySelector('.form') as HTMLFormElement
    )
    const formData = Object.fromEntries(formInstance)
    const formDataKeys = Object.keys(formData)

    const invalidInputs = formDataKeys.filter(
      (key) => formData[key as keyof typeof formData] === ''
    )

    if (invalidInputs.length > 0) {
      const firstInvalidInput = document.querySelector(
        `[name="${invalidInputs[0]}"]`
      ) as null | HTMLInputElement

      if (firstInvalidInput != null) {
        firstInvalidInput.focus()
      }

      return false
    }

    return true
  }

  const submitForm = async (
    isPending: boolean,
    callback: () => Promise<true | FirestoreErrorCode>,
    emit: () => void
  ) => {
    const isFormValid = checkFormValidity()
    if (!isFormValid) return

    isPending = true

    const response = await callback()
    handleResponse(response)
    emit()

    isPending = false
  }

  return {
    formsData,
    isNewInputAdded,
    isFormValid,
    addNewInput,
    handleBlur,
    removeInput,
    checkFormValidity,
    submitForm
  }
})

import type { FirestoreErrorCode } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'
import { handleResponse } from '../composables/responseHandler'
import { returnCircleColor } from '../composables/circleColor'

export const useFormsStore = defineStore('forms', () => {
  const boardsStore = useBoardsStore()
  const tasksStore = useTasksStore()

  const boardColumns = computed(() =>
    boardsStore.boardColumns.map((boardColumn) => ({
      name: boardColumn.name,
      id: boardColumn.columnID,
      dotColor: boardColumn.dotColor || ''
    }))
  )

  const subtasks = computed(() =>
    tasksStore.subtasksOfClickedTask.map((subtask) => ({
      name: subtask.title,
      id: subtask.subtaskID,
      dotColor: undefined
    }))
  )

  const formData = ref({
    board: {
      add: {
        data: {
          name: '',
          items: ['Todo', 'Doing'].map((item, index) => ({
            name: item,
            id: index.toString(),
            dotColor: returnCircleColor(index, undefined, false)
          })),
          placeholderItems: undefined
        },
        errors: {
          nameError: false,
          itemsErrors: [false, false]
        }
      },
      edit: {
        data: {
          name: boardsStore.currentBoard?.name || '',
          items: boardColumns.value,
          placeholderItems: undefined
        },
        errors: {
          nameError: false,
          itemsErrors: boardsStore.boardColumns.map(() => false)
        }
      }
    },
    task: {
      add: {
        data: {
          name: '',
          items: ['', ''].map((item, index) => ({
            name: item,
            id: index.toString(),
            dotColor: undefined
          })),
          placeholderItems: ['e.g. Make coffee', 'e.g. Drink coffee & smile']
        },
        errors: {
          nameError: false,
          itemsErrors: [false, false]
        }
      },
      edit: {
        data: {
          name: tasksStore.clickedTask?.title || '',
          items: subtasks.value,
          placeholderItems: undefined
        },
        errors: {
          nameError: false,
          itemsErrors: tasksStore.subtasks.map(() => false)
        }
      }
    }
  })

  const isNewInputAdded = ref(false)
  const isFormValid = ref(false)

  const addNewInput = (element: 'board' | 'task', action: 'add' | 'edit') => {
    const index = formData.value[element][action].data.items.length + 1

    formData.value[element][action].data.items.push({
      name: '',
      id: index.toString(),
      dotColor: element === 'board' ? 'hsl(193 75% 59%)' : undefined
    })
    formData.value[element][action].errors.itemsErrors.push(false)
    isNewInputAdded.value = true
  }

  const removeInput = (
    element: 'board' | 'task',
    action: 'add' | 'edit',
    index: number
  ) => {
    formData.value[element][action].data.items.splice(index, 1)
    formData.value[element][action].errors.itemsErrors.splice(index, 1)
  }

  const handleBlur = (
    element: 'board' | 'task',
    action: 'add' | 'edit',
    index?: number,
    isFormName?: true
  ) => {
    if (isFormName && formData.value[element][action].data.name === '') {
      formData.value[element][action].errors.nameError = true
    }

    if (isFormName && formData.value[element][action].data.name !== '') {
      formData.value[element][action].errors.nameError = false
    }

    if (
      index != null &&
      formData.value[element][action].data.items[index].name !== ''
    ) {
      formData.value[element][action].errors.itemsErrors[index] = false
    }

    if (
      index != null &&
      formData.value[element][action].data.items[index].name === ''
    ) {
      formData.value[element][action].errors.itemsErrors[index] = true
    }
  }

  const checkFormValidity = () => {
    const formInstance = new FormData(
      document.querySelector('[data-form]') as HTMLFormElement
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
    formData,
    isNewInputAdded,
    isFormValid,
    addNewInput,
    handleBlur,
    removeInput,
    checkFormValidity,
    submitForm
  }
})

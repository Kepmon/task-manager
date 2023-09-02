import type { BoardColumn, Subtask } from '../api/boardsTypes'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'

type Action = 'add' | 'edit'
type Element = 'board' | 'task'
type StoreItems = BoardColumn['name'][] | Subtask['title'][]
interface FormData {
  items: string[]
  placeholderItems: string[] | undefined
  errors: boolean[]
}

export const useFormsStore = defineStore('forms', () => {
  const boardsStore = useBoardsStore()
  const tasksStore = useTasksStore()

  const formsData = ref({
    board: ref({
      add: ref({
        items: ['Todo', 'Doing'],
        placeholderItems: undefined,
        errors: [false, false]
      }),
      edit: ref({
        items: [...boardsStore.boardColumnsNames],
        placeholderItems: undefined,
        errors: boardsStore.boardColumnsNames.map(() => false)
      })
    }),
    task: ref({
      add: ref({
        items: ['', ''],
        placeholderItems: ['e.g. Make coffee', 'e.g. Drink coffee & smile'],
        errors: [false, false]
      }),
      edit: ref({
        items: [...tasksStore.subtasksNames],
        placeholderItems: undefined,
        errors: tasksStore.subtasksNames.map(() => false)
      })
    })
  })

  const isNewInputAdded = ref(false)
  const addNewInput = (formData: FormData) => {
    formData.items.push('')
    formData.errors.push(false)
    isNewInputAdded.value = true
  }

  const handleBlur = (formData: FormData, index: number) => {
    if (formData.items[index] !== '') {
      formData.errors[index] = false
      return
    }

    formData.errors[index] = true
  }

  const removeInput = (formData: FormData, index: number) => {
    formData.items.splice(index, 1)
    formData.errors.splice(index, 1)
  }

  const validateForm = (
    formName: Ref<string>,
    formNameError: Ref<boolean>,
    formSubsetData: Ref<FormData>
  ) => {
    const isFormValid =
      formName.value !== '' &&
      formSubsetData.value.items.every((item) => item !== '')

    if (!isFormValid) {
      if (formName.value === '') {
        formNameError.value = true
      }

      formSubsetData.value.items.forEach((column, index) => {
        if (column !== '') return

        formSubsetData.value.errors[index] = true
      })
    }

    return isFormValid
  }

  const clearAllErrors = (
    element: Element,
    action: Action,
    itemsToIterateOver: StoreItems
  ) => {
    if (action === 'add') {
      formsData.value[element].add.errors = [false, false]
      return
    }

    formsData.value[element].edit.errors = itemsToIterateOver.map(() => false)
  }

  const resetFormData = (
    element: Element,
    action: Action,
    storeItems: StoreItems
  ) => {
    if (action === 'edit') {
      formsData.value[element].edit.items = [...storeItems]
      return
    }

    if (action === 'add' && element === 'board') {
      formsData.value.board.add.items = ['Todo', 'Doing']
      return
    }

    formsData.value.task.add.items = ['', '']
  }

  const updateFormData = (element: Element) => {
    formsData.value[element].edit.items = [...boardsStore.boardColumnsNames]
    formsData.value[element].edit.errors = boardsStore.boardColumnsNames.map(
      () => false
    )

    if (element === 'board') {
      formsData.value.board.add.items = ['Todo', 'Doing']
    }

    if (element === 'task') {
      formsData.value.task.add.items = ['', '']
    }

    formsData.value[element].add.errors = [false, false]
  }

  return {
    formsData,
    isNewInputAdded,
    addNewInput,
    handleBlur,
    removeInput,
    validateForm,
    clearAllErrors,
    resetFormData,
    updateFormData
  }
})

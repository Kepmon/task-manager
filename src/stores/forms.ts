import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'

type Action = 'add' | 'edit'
type Element = 'board' | 'task'
interface FormData {
  items: string[]
  placeholderItems: string[] | undefined
  errors: boolean[]
}

export const useFormsStore = defineStore('forms', () => {
  const boardsStore = useBoardsStore()
  const tasksStore = useTasksStore()

  const boardColumnsNames = computed(() =>
    boardsStore.boardColumns
      ? boardsStore.boardColumns.map((column) => column.name)
      : []
  )
  const columnErrors = computed(() =>
    boardColumnsNames.value
      ? boardColumnsNames.value.map(() => false)
      : [false, false]
  )

  const subtasksNames = computed(() =>
    tasksStore.subtasksOfClickedTask
      ? tasksStore.subtasksOfClickedTask.map((subtask) => subtask.title)
      : []
  )
  const subtasksErrors = ref(
    subtasksNames.value ? subtasksNames.value.map(() => false) : [false, false]
  )

  const returnFormSubsetData = (element: Element, action: Action) => {
    const formsData = ref({
      board: ref({
        items: action === 'add' ? ['Todo', 'Doing'] : boardColumnsNames.value,
        placeholderItems: undefined,
        errors: columnErrors.value
      }),
      task: ref({
        items: action === 'add' ? ['', ''] : (subtasksNames.value as string[]),
        placeholderItems:
          action === 'add'
            ? ['e.g. Make coffee', 'e.g. Drink coffee & smile']
            : undefined,
        errors: subtasksErrors.value
      })
    })

    return formsData.value[element]
  }

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
    formSubsetData: FormData
  ) => {
    const isFormValid =
      formName.value !== '' && formSubsetData.items.every((item) => item !== '')

    if (!isFormValid) {
      if (formName.value === '') {
        formNameError.value = true
      }

      formSubsetData.items.forEach((column, index) => {
        if (column !== '') return

        formSubsetData.errors[index] = true
      })

      return isFormValid
    }
  }

  return {
    columnErrors,
    subtasksErrors,
    isNewInputAdded,
    returnFormSubsetData,
    addNewInput,
    handleBlur,
    removeInput,
    validateForm
  }
})

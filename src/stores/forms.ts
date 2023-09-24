import type { FormData } from '../api/boardsTypes'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'

export const useFormsStore = defineStore('forms', () => {
  const boardsStore = useBoardsStore()
  const tasksStore = useTasksStore()

  const boardColumns = computed(() =>
    boardsStore.boardColumns
      ? boardsStore.boardColumns.map((boardColumn) => ({
          name: boardColumn.name,
          id: boardColumn.columnID
        }))
      : []
  )

  const subtasks = computed(() =>
    tasksStore.subtasksOfClickedTask.length > 0
      ? tasksStore.subtasksOfClickedTask.map((subtask) => ({
          name: subtask.title,
          id: subtask.subtaskID
        }))
      : []
  )

  const formsData = ref({
    board: ref({
      add: ref({
        items: ['Todo', 'Doing'].map((item, index) => ({
          name: item,
          id: index.toString()
        })),
        placeholderItems: undefined,
        errors: [false, false]
      }),
      edit: ref({
        items: boardColumns,
        placeholderItems: undefined,
        errors: boardsStore.boardColumns.map(() => false)
      })
    }),
    task: ref({
      add: ref({
        items: ['', ''].map((item, index) => ({
          name: item,
          id: index.toString()
        })),
        placeholderItems: ['e.g. Make coffee', 'e.g. Drink coffee & smile'],
        errors: [false, false]
      }),
      edit: ref({
        items: subtasks,
        placeholderItems: undefined,
        errors: tasksStore.subtasks.map(() => false)
      })
    })
  })

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

  const checkFormValidity = (
    formName: Ref<string>,
    formSubsetData: Ref<FormData>
  ) => {
    isFormValid.value =
      formName.value !== '' &&
      formSubsetData.value.items.every((item) => item.name !== '')
  }

  const handleFormValidation = (
    formName: Ref<string>,
    formNameError: Ref<boolean>,
    formSubsetData: Ref<FormData>
  ) => {
    if (!isFormValid.value) {
      if (formName.value === '') {
        formNameError.value = true
      }

      formSubsetData.value.items.forEach((column, index) => {
        if (column.name !== '') return

        formSubsetData.value.errors[index] = true
      })
    }
  }

  return {
    formsData,
    isNewInputAdded,
    isFormValid,
    addNewInput,
    handleBlur,
    removeInput,
    checkFormValidity,
    handleFormValidation
  }
})

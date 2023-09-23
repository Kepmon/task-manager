import type { FormData } from '../api/boardsTypes'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'

type Element = 'board' | 'task'

export const useFormsStore = defineStore('forms', () => {
  const boardsStore = useBoardsStore()
  const tasksStore = useTasksStore()

  const boardColumns = ref(
    boardsStore.boardColumns
      ? boardsStore.boardColumns.map((boardColumn) => ({
          name: boardColumn.name,
          id: boardColumn.columnID
        }))
      : []
  )

  const subtasks = ref(
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

  const updateFormData = (element: Element) => {
    if (element === 'board') {
      formsData.value.board.edit.items = boardsStore.boardColumns
        ? boardsStore.boardColumns.map((boardColumn) => ({
            name: boardColumn.name,
            id: boardColumn.columnID
          }))
        : []
      formsData.value.board.edit.errors = formsData.value.board.edit.items.map(
        () => false
      )

      formsData.value.board.add.items = ['Todo', 'Doing'].map(
        (item, index) => ({
          name: item,
          id: index.toString()
        })
      )
      formsData.value.board.add.errors = [false, false]
      return
    }

    formsData.value.task.edit.items =
      tasksStore.subtasksOfClickedTask.length > 0
        ? tasksStore.subtasksOfClickedTask.map((subtask) => ({
            name: subtask.title,
            id: subtask.subtaskID
          }))
        : []
    formsData.value.task.edit.errors = formsData.value.task.edit.items.map(
      () => false
    )

    formsData.value.task.add.items = ['', ''].map((item, index) => ({
      name: item,
      id: index.toString()
    }))
    formsData.value.task.add.errors = [false, false]
  }

  return {
    formsData,
    isNewInputAdded,
    isFormValid,
    addNewInput,
    handleBlur,
    removeInput,
    checkFormValidity,
    handleFormValidation,
    updateFormData
  }
})

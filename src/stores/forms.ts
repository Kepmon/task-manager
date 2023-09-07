import type { Subtask, FormSubsetItem } from '../api/boardsTypes'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBoardsStore } from './boards'
import { useTasksStore } from './tasks'

type Element = 'board' | 'task'
interface FormData {
  items: FormSubsetItem[]
  placeholderItems: string[] | undefined
  errors: boolean[]
}

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
    tasksStore.subtasksOfClickedTask
      ? (tasksStore.subtasksOfClickedTask as Subtask[]).map((subtask) => ({
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
        errors: boardsStore.boardColumnsNames.map(() => false)
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
        errors: tasksStore.subtasksNames.map(() => false)
      })
    })
  })

  const isNewInputAdded = ref(false)

  const addNewInput = (formData: FormData) => {
    const index = formData.items.length + 1

    formData.items.push({
      name: '',
      id: index.toString()
    })
    formData.errors.push(false)
    isNewInputAdded.value = true
  }

  const handleBlur = (formData: FormData, index: number) => {
    if (formData.items[index].name !== '') {
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
      formSubsetData.value.items.every((item) => item.name !== '')

    if (!isFormValid) {
      if (formName.value === '') {
        formNameError.value = true
      }

      formSubsetData.value.items.forEach((column, index) => {
        if (column.name !== '') return

        formSubsetData.value.errors[index] = true
      })
    }

    return isFormValid
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

    formsData.value.task.edit.items = tasksStore.subtasksOfClickedTask
      ? (tasksStore.subtasksOfClickedTask as Subtask[]).map((subtask) => ({
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
    addNewInput,
    handleBlur,
    removeInput,
    validateForm,
    updateFormData
  }
})

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
          nameError: {
            emptyError: false,
            tooLongError: false
          },
          itemsErrors: [
            {
              emptyError: false,
              tooLongError: false
            },
            {
              emptyError: false,
              tooLongError: false
            }
          ]
        }
      },
      edit: {
        data: {
          name: boardsStore.currentBoard?.name || '',
          items: boardColumns.value,
          placeholderItems: undefined
        },
        errors: {
          nameError: {
            emptyError: false,
            tooLongError: false
          },
          itemsErrors: boardsStore.boardColumns.map(() => ({
            emptyError: false,
            tooLongError: false
          }))
        }
      }
    },
    task: {
      add: {
        data: {
          name: '',
          description: '',
          items: ['', ''].map((item, index) => ({
            name: item,
            id: index.toString(),
            dotColor: undefined
          })),
          placeholderItems: ['e.g. Make coffee', 'e.g. Drink coffee & smile']
        },
        errors: {
          nameError: {
            emptyError: false,
            tooLongError: false
          },
          itemsErrors: [
            {
              emptyError: false,
              tooLongError: false
            },
            {
              emptyError: false,
              tooLongError: false
            }
          ]
        }
      },
      edit: {
        data: {
          name: tasksStore.clickedTask?.title || '',
          description: tasksStore.clickedTask?.description || '',
          items: subtasks.value,
          placeholderItems: undefined
        },
        errors: {
          nameError: {
            emptyError: false,
            tooLongError: false
          },
          itemsErrors: tasksStore.subtasks.map(() => ({
            emptyError: false,
            tooLongError: false
          }))
        }
      }
    }
  })

  const isNewInputAdded = ref(false)
  const isFormValid = ref(false)

  const addNewInput = (element: 'board' | 'task', action: 'add' | 'edit') => {
    const index = formData.value[element][action].data.items.length + 1

    element === 'board'
      ? formData.value['board'][action].data.items.push({
          name: '',
          id: index.toString(),
          dotColor: 'hsl(193 75% 59%)'
        })
      : formData.value['task'][action].data.items.push({
          name: '',
          id: index.toString(),
          dotColor: undefined
        })

    formData.value[element][action].errors.itemsErrors.push({
      emptyError: false,
      tooLongError: false
    })
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
    index?: number
  ) => {
    const dataToCheck =
      index == null
        ? formData.value[element][action].data.name
        : formData.value[element][action].data.items[index].name
    const errorToEdit =
      index == null
        ? formData.value[element][action].errors.nameError
        : formData.value[element][action].errors.itemsErrors[index]

    const inputErrors = {
      emptyError: dataToCheck.trim() === '',
      tooLongError: dataToCheck.trim().length > 80
    }
    const inputErrorsKeys = Object.keys(inputErrors)

    inputErrorsKeys.forEach((key) => {
      if (inputErrors[key]) {
        errorToEdit[key] = true
      } else {
        errorToEdit[key] = false
      }
    })
  }

  const checkFormValidity = (
    element: 'board' | 'task',
    action: 'add' | 'edit'
  ) => {
    const formInstance = new FormData(
      document.querySelector('[data-form]') as HTMLFormElement
    )
    const formDataObj = Object.fromEntries(formInstance)
    const formDataKeys = Object.keys(formDataObj)

    const allInvalidInputs = formDataKeys.filter(
      (key) =>
        (formDataObj[key as keyof typeof formDataObj] as string).trim() ===
          '' ||
        (formDataObj[key as keyof typeof formDataObj] as string).trim().length >
          80
    )
    const emptyInputs = formDataKeys.filter(
      (key) =>
        (formDataObj[key as keyof typeof formDataObj] as string).trim() === ''
    )
    const tooLongInputs = formDataKeys.filter(
      (key) =>
        (formDataObj[key as keyof typeof formDataObj] as string).trim().length >
        80
    )

    if (allInvalidInputs.length > 0) {
      const firstInvalidInput = document.querySelector(
        `[name="${allInvalidInputs[0]}"]`
      ) as null | HTMLInputElement

      if (firstInvalidInput != null) {
        firstInvalidInput.select()
      }

      if (emptyInputs.length > 0) {
        if (emptyInputs.includes(`${element}Title`)) {
          formData.value[element][action].errors.nameError.emptyError = true
        } else {
          formData.value[element][action].errors.nameError.emptyError = false
        }

        emptyInputs.forEach((input) => {
          if (input === `${element}Title`) return

          const indexOfInvalidInput = formDataKeys.indexOf(input) - 1

          if (indexOfInvalidInput >= 0) {
            formData.value[element][action].errors.itemsErrors[
              indexOfInvalidInput
            ].emptyError = true
          } else {
            formData.value[element][action].errors.itemsErrors[
              indexOfInvalidInput
            ].emptyError = false
          }
        })

        if (tooLongInputs.includes(`${element}Title`)) {
          formData.value[element][action].errors.nameError.tooLongError = true
        } else {
          formData.value[element][action].errors.nameError.tooLongError = false
        }

        tooLongInputs.forEach((input) => {
          if (input === `${element}Title`) return

          const indexOfInvalidInput = formDataKeys.indexOf(input) - 1

          if (indexOfInvalidInput >= 0) {
            formData.value[element][action].errors.itemsErrors[
              indexOfInvalidInput
            ].tooLongError = true
          } else {
            formData.value[element][action].errors.itemsErrors[
              indexOfInvalidInput
            ].tooLongError = false
          }
        })

        return false
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
    isPending = true

    const response = await callback()
    handleResponse(response)
    emit()

    isPending = false
  }

  const resetFormData = (element: 'board' | 'task', action: 'add' | 'edit') => {
    if (element === 'board' && action === 'add') {
      formData.value.board.add = {
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
          nameError: {
            emptyError: false,
            tooLongError: false
          },
          itemsErrors: [
            {
              emptyError: false,
              tooLongError: false
            },
            {
              emptyError: false,
              tooLongError: false
            }
          ]
        }
      }
    }

    if (element === 'board' && action === 'edit') {
      formData.value.board.edit = {
        data: {
          name: boardsStore.currentBoard?.name || '',
          items: boardColumns.value,
          placeholderItems: undefined
        },
        errors: {
          nameError: {
            emptyError: false,
            tooLongError: false
          },
          itemsErrors: boardsStore.boardColumns.map(() => ({
            emptyError: false,
            tooLongError: false
          }))
        }
      }
    }

    if (element === 'task' && action === 'add') {
      formData.value.task.add = {
        data: {
          name: '',
          description: '',
          items: ['', ''].map((item, index) => ({
            name: item,
            id: index.toString(),
            dotColor: undefined
          })),
          placeholderItems: ['e.g. Make coffee', 'e.g. Drink coffee & smile']
        },
        errors: {
          nameError: {
            emptyError: false,
            tooLongError: false
          },
          itemsErrors: [
            {
              emptyError: false,
              tooLongError: false
            },
            {
              emptyError: false,
              tooLongError: false
            }
          ]
        }
      }
    }

    if (element === 'task' && action === 'edit') {
      formData.value.task.edit = {
        data: {
          name: tasksStore.clickedTask?.title || '',
          description: tasksStore.clickedTask?.description || '',
          items: subtasks.value,
          placeholderItems: undefined
        },
        errors: {
          nameError: {
            emptyError: false,
            tooLongError: false
          },
          itemsErrors: tasksStore.subtasks.map(() => ({
            emptyError: false,
            tooLongError: false
          }))
        }
      }
    }
  }

  return {
    formData,
    isNewInputAdded,
    isFormValid,
    addNewInput,
    handleBlur,
    removeInput,
    checkFormValidity,
    submitForm,
    resetFormData
  }
})

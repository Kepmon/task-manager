import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { handleResponse } from '../composables/responseHandler'
import { returnCircleColor } from '../composables/circleColor'
import { nanoid } from 'nanoid'

export const useFormsStore = defineStore('forms', () => {
  const userStore = useUserStore()

  const elementEditName = computed(() => ({
    board: userStore.userData.currentBoard.boardName,
    task: userStore.userData.currentBoard.clickedTask?.title || ''
  }))
  const subsetItems = computed(() => ({
    board: {
      add: ['Todo', 'Doing'].map((item, index) => ({
        name: item,
        id: nanoid(),
        dotColor: returnCircleColor(index, undefined, true)
      })),
      edit: userStore.userData.currentBoard.boardColumns.map(
        ({ name, columnID, dotColor }, index) => ({
          name,
          id: columnID,
          dotColor:
            dotColor != null
              ? dotColor
              : returnCircleColor(index, undefined, false)
        })
      )
    },
    task: {
      add: ['', ''].map((item, index) => ({
        name: item,
        id: nanoid(),
        dotColor: returnCircleColor(index, undefined, true)
      })),
      edit: userStore.userData.currentBoard.subtasksOfClickedTask.map(
        ({ title, subtaskID }) => ({
          name: title,
          id: subtaskID,
          dotColor: undefined
        })
      )
    }
  }))

  const returnFormDataObj = (
    element: 'board' | 'task',
    action: 'add' | 'edit'
  ) => {
    return {
      data: {
        name: action === 'add' ? '' : elementEditName.value[element],
        description:
          element === 'board'
            ? undefined
            : action === 'add'
            ? ''
            : userStore.userData.currentBoard.clickedTask?.description || '',
        items: [...subsetItems.value[element][action]],
        placeholderItems:
          element === 'board'
            ? undefined
            : ['e.g. Make coffee', 'e.g. Drink coffee & smile']
      },
      errors: {
        nameError: {
          emptyError: false,
          tooLongError: false
        },
        itemsErrors: subsetItems.value[element][action].map(() => ({
          emptyError: false,
          tooLongError: false
        }))
      }
    }
  }
  const formData = ref({
    board: {
      add: {
        ...returnFormDataObj('board', 'add')
      },
      edit: {
        ...returnFormDataObj('board', 'edit')
      }
    },
    task: {
      add: {
        ...returnFormDataObj('task', 'add')
      },
      edit: {
        ...returnFormDataObj('board', 'edit')
      }
    }
  })

  const isNewInputAdded = ref(false)
  const isFormValid = ref(false)

  const addNewInput = (element: 'board' | 'task', action: 'add' | 'edit') => {
    const newItem = {
      name: '',
      id: nanoid(),
      dotColor: element === 'board' ? 'hsl(193 75% 59%)' : undefined
    }

    formData.value[element][action].data.items.push(newItem)
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
      if (inputErrors[key as keyof typeof inputErrors]) {
        errorToEdit[key as keyof typeof inputErrors] = true
      } else {
        errorToEdit[key as keyof typeof inputErrors] = false
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
    callback: () => Promise<boolean>,
    emit: () => void
  ) => {
    isPending = true

    const response = await callback()
    handleResponse(response)
    emit()

    isPending = false
  }

  const resetFormData = (element: 'board' | 'task', action: 'add' | 'edit') => {
    formData.value[element][action] = returnFormDataObj(element, action)
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

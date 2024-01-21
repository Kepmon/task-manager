import type { Subtask } from '../../api/boardsTypes'
import type { FormDataProperties } from '../../api/formsTypes'
import { collection, doc } from 'firebase/firestore'
import { db } from '../../firebase'
import { returnColumnsColRef } from './boardHelpers'
import { returnPartsOfUserData } from './userHelpers'

export const returnNeededVars = () => {
  const {
    boardColumns,
    boardTasks,
    boardSubtasks,
    clickedTask,
    columnOfClickedTask: indexOfColumn
  } = returnPartsOfUserData()

  if (indexOfColumn == null) return { indexOfColumn }

  const columnOfEditedTask = boardColumns[indexOfColumn]
  const indexOfClickedTask = boardTasks[indexOfColumn].findIndex(
    ({ taskID }) => taskID === clickedTask?.taskID
  )
  const subtasksToBeEdited =
    boardSubtasks.find((subtasksArr) =>
      subtasksArr.every(({ taskID: id }) => id === clickedTask?.taskID)
    ) || []

  const columnsColRef = returnColumnsColRef().columnsColRef
  const columnDocRef = doc(columnsColRef, columnOfEditedTask.columnID)
  const tasksColRef = collection(db, `${columnDocRef.path}/tasks`)
  const taskDocRef = doc(tasksColRef, clickedTask?.taskID)
  const subtasksColRef = collection(db, `${taskDocRef.path}/subtasks`)

  return {
    indexOfColumn,
    indexOfClickedTask,
    taskDocRef,
    subtasksToBeEdited,
    subtasksColRef
  }
}

export const checkWhetherFormDataWasChanged = (
  formData: FormDataProperties,
  subtasksToBeEdited: Subtask[],
  isStatusChanged: boolean
) => {
  const { clickedTask } = returnPartsOfUserData()

  const isTaskNameSame = formData.name === clickedTask?.title
  const isDescriptionSame = formData.description === clickedTask?.description
  const isNumberOfSubtaskSame =
    subtasksToBeEdited.length === formData.items.length
  const areSubtasksTitlesSame = subtasksToBeEdited.every(
    ({ subtaskID, title }) =>
      formData.items.find(({ name, id }) => title === name && subtaskID === id)
  )

  const isFormNotChanged = [
    isTaskNameSame,
    isDescriptionSame,
    isNumberOfSubtaskSame,
    areSubtasksTitlesSame
  ].every((item) => item === true)

  if (isFormNotChanged && !isStatusChanged)
    return { wasFormEvenEdited: isFormNotChanged }

  return {
    wasFormEvenEdited: !isFormNotChanged,
    isTaskNameSame,
    isDescriptionSame
  }
}

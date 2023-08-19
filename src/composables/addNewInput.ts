import type { Ref } from 'vue'
import type { BoardColumn } from '../api/boardsTypes'

interface InputData {
  name: string
  title: string
  description: string
  columns: string[]
  subtasks: string[]
  statusItems: BoardColumn[]
  selectedStatusItem: BoardColumn
}
type ErrorsArr = Ref<boolean[]>
type IsNewInput = Ref<boolean>

export const addNewInput = (
  formData: Ref<Partial<InputData>>,
  errorsArr: ErrorsArr,
  isNewInputAdded: IsNewInput
) => {
  if ('columns' in formData.value) {
    ;(formData.value.columns as InputData['columns']).push('')
  }
  if ('subtasks' in formData.value) {
    ;(formData.value.subtasks as InputData['subtasks']).push('')
  }

  errorsArr.value.push(false)
  isNewInputAdded.value = true
}

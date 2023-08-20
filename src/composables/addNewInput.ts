import type { Ref } from 'vue'

export const addNewInput = (
  items: Ref<string[]>,
  errorsArr: Ref<boolean[]>,
  isNewInputAdded: Ref<boolean>
) => {
  items.value.push('')
  errorsArr.value.push(false)
  isNewInputAdded.value = true
}

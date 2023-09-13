import type { Ref } from 'vue'

const toggleOptions = (e: Event, conditionToChange: Ref<boolean>) => {
  conditionToChange.value = !conditionToChange.value
}
const closeOptions = (
  e: Event | KeyboardEvent,
  conditionToChange: Ref<boolean>
) => {
  const clickedItem = (e.target as HTMLElement).closest('button')
  const isProtected = clickedItem?.getAttribute('data-protected') != null
  const wasEscPressed = (e as KeyboardEvent).key === 'Escape'

  if (isProtected && !wasEscPressed) return

  conditionToChange.value = false
}

export default { toggleOptions, closeOptions }
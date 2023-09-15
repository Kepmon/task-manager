import type { Ref } from 'vue'

const toggleOptions = (e: Event, conditionToChange: Ref<boolean>) => {
  conditionToChange.value = !conditionToChange.value
}
const closeOptions = (
  e: Event | KeyboardEvent,
  conditionToChange: Ref<boolean>,
  protectedElement: string
) => {
  const clickedButton = (e.target as HTMLElement).closest('button')
  const isProtected =
    clickedButton?.getAttribute('data-protected') === protectedElement
  const wasEscPressed = (e as KeyboardEvent).key === 'Escape'

  if (isProtected && !wasEscPressed) return

  conditionToChange.value = false
}

export default { toggleOptions, closeOptions }

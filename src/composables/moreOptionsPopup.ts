import { Ref } from 'vue'

const toggleOptions = (e: Event, conditionToChange: Ref<boolean>) => {
    conditionToChange.value = !conditionToChange.value
}
const closeOptions = (e: Event, conditionToChange: Ref<boolean>) => {
    const clickedItem = e.target as HTMLElement

    if (clickedItem.getAttribute('data-ellipsis') != null) return

    conditionToChange.value = false
}

export default { toggleOptions, closeOptions }
<template>
  <div v-if="itemsToBeIteratedOver?.length">
    <p class="mb-2 text-xs">
      {{ element === 'board' ? 'Columns' : 'Subtasks' }}
    </p>
    <div class="grid gap-3">
      <div
        v-for="(item, index) in itemsToBeIteratedOver"
        :key="index"
        class="flex items-center"
      >
        <text-input
          @handle-blur="() => handleAddNewItem(item, index)"
          @update:model-value="(newValue: string) => updateInputValue(newValue, index)"
          :modelValue="item"
          :placeholder="
            action === 'add' && element === 'task'
              ? formData.task.placeholderItems[index]
              : ''
          "
          :isError="errorsArr[index]"
          :condition="
            index === itemsToBeIteratedOver.length - 1 && isNewInputAdded
          "
          class="grow"
          :class="{
            'input-error': errorsArr[index] === true
          }"
        ></text-input>
        <close-icon
          @handle-close="() => handleRemoveItem(index)"
          :listItem="item"
          :isError="errorsArr[index]"
        />
      </div>
    </div>
  </div>
  <the-button
    @click="addNewColumn"
    :regularButton="true"
    :isInForm="true"
    class="white-button"
    type="button"
  >
    + Add New {{ element === 'board' ? 'Column' : 'Subtask' }}
  </the-button>
</template>

<script setup lang="ts">
import TextInput from './Inputs/TextInput.vue'
import CloseIcon from '../Svgs/CloseIcon.vue'
import TheButton from './TheButton.vue'
import { addNewInput } from '../../composables/addNewInput'
import { useTasksStore } from '../../stores/tasks'
import { useBoardsStore } from '../../stores/boards'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
  element: 'board' | 'task'
}>()
const emits = defineEmits(['change-array-item'])

const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()

const formData = ref({
  board: ref({
    items:
      props.action === 'add'
        ? ['Todo', 'Doing']
        : (boardsStore.boardColumnsNames as string[]),
    errors: boardsStore.columnErrors
  }),
  task: ref({
    items:
      props.action === 'add'
        ? ['', '']
        : (tasksStore.subtasksNames as string[]),
    placeholderItems: ['e.g. Make coffee', 'e.g. Drink coffee & smile'],
    errors: tasksStore.subtasksErrors
  })
})
const itemsToBeIteratedOver = ref(formData.value[props.element].items)
const errorsArr = ref(formData.value[props.element].errors)

const isNewInputAdded = ref(false)
const addNewColumn = () => {
  addNewInput(itemsToBeIteratedOver, errorsArr, isNewInputAdded)
}

const updateInputValue = (newValue: string, index: number) => {
  ;(itemsToBeIteratedOver.value as string[])[index] = newValue

  emits('change-array-item', itemsToBeIteratedOver.value)
}

const handleAddNewItem = (item: string, index: number) => {
  item === ''
    ? (errorsArr.value[index] = true)
    : (errorsArr.value[index] = false)

  emits('change-array-item', itemsToBeIteratedOver.value)
}

const handleRemoveItem = (index: number) => {
  ;(itemsToBeIteratedOver.value as string[]).splice(index, 1)

  emits('change-array-item', itemsToBeIteratedOver.value)
}
</script>

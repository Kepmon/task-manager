<template>
  <div v-if="itemsToBeIteratedOver.length">
    <p class="mb-2 text-xs">Subtasks</p>
    <div class="grid gap-3">
      <div
        v-for="(item, index) in itemsToBeIteratedOver"
        :key="index"
        class="flex items-center"
      >
        <text-input
          @handle-blur="() => handleAddNewItem(item, index)"
          @update:model-value="(newValue: string) => ((itemsToBeIteratedOver as string[])[index] = newValue)"
          :modelValue="item"
          :placeholder="action === 'add' ? item : ''"
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
import type { Task, Subtask } from '../../api/boardsTypes'
import TextInput from './Inputs/TextInput.vue'
import CloseIcon from '../Svgs/CloseIcon.vue'
import TheButton from './TheButton.vue'
import { addNewInput } from '../../composables/addNewInput'
import { useBoardsStore } from '../../stores/boards'
import { ref, toRefs } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
  element: 'board' | 'task'
  columnIndex?: number
  task?: Task
  subtasks?: Subtask[]
}>()
const emits = defineEmits(['change-array-item'])

const boardsStore = useBoardsStore()

const formData = ref({
  board: ref({
    name:
      props.action === 'add' ? '' : (boardsStore.currentBoard?.name as string),
    columns:
      props.action === 'add'
        ? ['Todo', 'Doing']
        : (boardsStore.boardColumnsNames as string[])
  }),
  task: ref({
    title: props.task != null ? props.task.title : '',
    description: props.task != null ? props.task.description : '',
    subtasks:
      props.subtasks != null
        ? props.subtasks.map((subtask) => subtask.title)
        : ['e.g. Make coffee', 'e.g. Drink coffee & smile'],
    statusItems: boardsStore.boardColumns,
    selectedStatusItem:
      props.columnIndex != null
        ? boardsStore.boardColumns[props.columnIndex]
        : boardsStore.boardColumns[0]
  })
})
const itemsToBeIteratedOver = ref(
  props.element === 'board'
    ? formData.value.board.columns
    : formData.value.task.subtasks
)

const columnErrors = ref(formData.value.board.columns.map(() => false))
const subtaskErrors = ref(formData.value.task.subtasks.map(() => false))
const errorsArr = ref(props.element === 'board' ? columnErrors : subtaskErrors)

const isNewInputAdded = ref(false)
const addNewColumn = () => {
  addNewInput(toRefs(formData.value)[props.element], errorsArr, isNewInputAdded)
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

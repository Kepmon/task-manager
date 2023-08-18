<template>
  <modals-template @close-modal="$emit('close-modal')">
    <template #form-title>
      <h2 class="text-red-400">Delete this {{ elementToDelete }}?</h2>
    </template>

    <template #main-content>
      <p class="text-sm text-gray-400 font-normal">
        {{ message }}
      </p>

      <div class="flex flex-col s:flex-row gap-4">
        <the-button
          @click="() => submit(elementID)"
          :regularButton="true"
          :isInForm="true"
          class="red-button"
        >
          Delete
        </the-button>

        <the-button
          @click="$emit('close-modal')"
          :regularButton="true"
          :isInForm="true"
          type="button"
          class="white-button"
        >
          Cancel
        </the-button>
      </div>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import ModalsTemplate from './ModalsTemplate.vue'
import TheButton from '../shared/TheButton.vue'
import { computed } from 'vue'
import { useBoardsStore } from '../../stores/boards'
import { Board, BoardColumn, Task } from '../../api/boardsTypes'

type ElementID = Board['boardID'] | BoardColumn['columnID'] | Task['taskID']
const props = defineProps<{
  elementToDelete: 'board' | 'column' | 'task'
  elementName: string
  elementID: ElementID
}>()
const emits = defineEmits(['close-modal'])

const message = computed(() => {
  const prefix = `Are you sure you want to delete the '${props.elementName}'`
  const suffix = {
    board:
      'This action will remove all columns and its tasks and cannot be reversed.',
    column:
      'This action will remove this column and all its tasks and cannot be reversed.',
    task: 'This action will remove this task and all its subtasks and cannot be reversed.'
  }

  return `${prefix} ${props.elementToDelete}? ${suffix[props.elementToDelete]}`
})

const boardsStore = useBoardsStore()
const submitFns = {
  board: boardsStore.deleteBoard,
  column: boardsStore.deleteColumn,
  task: () => null
}

const submit = async (elementID: ElementID) => {
  emits('close-modal')

  await submitFns[props.elementToDelete](elementID)
}
</script>

<style lang="postcss" scoped>
.red-button {
  @apply text-white bg-red-400 hover:bg-red-200 focus-visible:bg-red-200;
  @apply transition-colors duration-300 outline outline-transparent;
}
</style>

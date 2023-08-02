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
          @click="submit"
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

const props = defineProps<{
  elementToDelete: 'board' | 'task'
  elementName: string
}>()
const emits = defineEmits(['close-modal'])

const message = computed(() => {
  const prefix = `Are you sure you want to delete the '${props.elementName}'`
  const suffix =
    props.elementToDelete === 'board'
      ? 'This action will remove all columns and tasks and cannot be reversed.'
      : 'This action cannot be reversed.'

  return `${prefix} ${props.elementToDelete}${
    props.elementToDelete === 'task' ? ' and its subtasks' : ''
  }?
    ${suffix}`
})

const boardsStore = useBoardsStore()
const submit = () => {
  emits('close-modal')

  if (props.elementToDelete === 'board') {
    boardsStore.deleteBoard()
  }
}
</script>

<style lang="postcss" scoped>
.red-button {
  @apply text-white bg-red-400 hover:bg-red-200 focus-visible:bg-red-200;
  @apply transition-colors duration-300 outline outline-transparent;
}
</style>
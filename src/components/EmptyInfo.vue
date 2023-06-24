<template>
  <div
    v-if="emptyElement.dashboard || emptyElement.board"
    class="flex flex-col items-center justify-center"
  >
    <p
      class="mb-[25px] text-lg text-center text-gray-400 first-letter:capitalize"
    >
      {{ message }}
    </p>
    <the-button :regularButton="true" class="gap-[2px] w-max purple-class">
      + Add New
      <span class="capitalize">{{
        emptyElement.dashboard ? 'board' : 'column'
      }}</span>
    </the-button>
  </div>
</template>

<script setup lang="ts">
import TheButton from '../components/shared/TheButton.vue'
import { useBoardsStore } from '../stores/boards'
import { computed } from 'vue'

const { boards, columns } = useBoardsStore()
const emptyElement = computed(() => ({
  dashboard: boards.length === 0,
  board: columns.length === 0
}))

const message = computed(
  () =>
    `${
      emptyElement.value.dashboard ? 'your dashboard' : 'this board'
    } is empty. Create a new ${
      emptyElement.value.dashboard ? 'board' : 'column'
    }.`
)
</script>

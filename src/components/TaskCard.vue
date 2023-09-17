<template>
  <button class="task-card group" :aria-labelledby="`task-card-${taskID}`">
    <p aria-hidden="true" class="task-card__title">
      {{ title }}
    </p>
    <p
      v-if="howManySubtasks !== 0"
      class="text-gray-400 text-xs"
      aria-hidden="true"
    >
      {{ howManyCompleted }} of {{ howManySubtasks }} subtasks
    </p>
    <span :id="`task-card-${taskID}`" class="sr-only"
      >{{ title }} - {{ howManyCompleted }} of
      {{ howManySubtasks }} subtasks</span
    >
  </button>
</template>

<script setup lang="ts">
defineProps<{
  taskID: string
  title: string
  howManyCompleted: number
  howManySubtasks: number
}>()
</script>

<style lang="postcss" scoped>
.task-card {
  @apply p-4 text-left shadow-xs rounded-lg bg-white dark:bg-gray-700;
}

.task-card__title {
  @apply mb-1 group-hover:text-purple-600 group-focus-visible:text-purple-600;
  @apply transition-colors duration-300;
}
</style>

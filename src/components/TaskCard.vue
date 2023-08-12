<template>
  <div
    @click="$emit('change', title)"
    @keypress.enter="$emit('change', title)"
    tabindex="0"
    class="task-card group"
  >
    <p class="task-card__title">
      {{ title }}
    </p>
    <p v-if="howManySubtasks !== 0" class="text-gray-400 text-xs">
      {{ howManyCompleted }} of {{ howManySubtasks }} subtasks
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  howManyCompleted: number
  howManySubtasks: number
}>()
defineEmits(['change'])
</script>

<style lang="postcss" scoped>
.task-card {
  @apply p-4 mb-[20px] w-[280px] text-left shadow-sm cursor-pointer rounded-lg;
  @apply bg-white dark:bg-gray-700;
}

.task-card__title {
  @apply mb-1 group-hover:text-purple-400 group-focus:text-purple-400;
  @apply transition-colors duration-300;
}
</style>

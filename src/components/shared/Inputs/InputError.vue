<template>
  <p class="error-message">{{ message }}</p>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<style lang="postcss">
.error-message {
  @apply absolute top-1 right-2 p-2 text-sm text-red-400;
  @apply bg-white dark:bg-gray-700 pointer-events-none;
}
</style>

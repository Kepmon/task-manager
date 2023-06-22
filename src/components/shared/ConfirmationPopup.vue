<template>
  <p
    class="popup-text"
    :class="{ 'bg-green-600': !isError, 'bg-red-400': isError }"
  >
    {{ message }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  isError: boolean
}>()

const message = computed(() => {
  if (props.isError) {
    return 'Ooops, something went wrong. Try again later.'
  }

  return `You ${
    useRoute().path === '/' ? 'logged in' : 'signed up'
  } successfully`
})
</script>

<style scoped>
.popup-text {
  @apply absolute inset-0 bottom-auto py-10 mx-auto w-[min(90%,400px)];
  @apply translate-y-8 text-center text-gray-900 rounded-xl;
}
</style>

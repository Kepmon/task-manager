<template>
  <button @click="skipToMain" class="skip-to-content">Skip to content</button>
</template>

<script setup lang="ts">
const skipToMain = () => {
  const elementToBeFocus = document.querySelector('[data-focus]') as HTMLButtonElement
  elementToBeFocus.focus()
}
</script>

<style scoped>
.skip-to-content {
  @apply absolute left-0 top-0 p-4 mt-[var(--room-for-outline)] ml-[var(--room-for-outline)];
  @apply bg-purple-400 rounded-[4px] text-white outline-white outline-default z-10;
  @apply -translate-y-[120%] focus-visible:translate-y-0 transition-transform duration-300;
}
</style>

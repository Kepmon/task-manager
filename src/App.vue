<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
html {
  @apply bg-gray-200 text-black;
}

html.dark {
  @apply bg-gray-800 text-white;
}

body {
  @apply min-h-screen text-base font-semibold;
}

::-webkit-scrollbar-corner {
  @apply bg-transparent;
}

.v-select {
  @apply bg-white dark:bg-gray-700 shadow-option rounded-[4px];
}

.v-select .vs__selected,
.v-select .vs__search {
  @apply text-sm text-black dark:text-white;
}

.v-select.vs--single.vs--open .vs__selected {
  @apply static opacity-100;
}

.v-select .vs__actions {
  @apply pt-[6px];
}

.v-select .vs__actions::after {
  @apply content-[''] absolute inset-0 z-10;
}

.v-select .vs__clear {
  @apply hidden;
}

.v-select .vs__open-indicator {
  @apply box-content p-2 fill-purple-400;
}

.v-select .vs__dropdown-menu {
  @apply absolute top-10 rounded-lg text-sm text-gray-400;
  @apply bg-white dark:bg-gray-800;
}

.v-select:has(:focus) .vs__dropdown-toggle {
  @apply border-purple-400;
}

.v-select .vs__dropdown-option {
  @apply py-2;
}

.v-select .vs__dropdown-option--highlight {
  @apply bg-purple-400;
}

.dialog-enter-from,
.dialog-leave-to {
  @apply opacity-0;
}

.dialog-enter-active,
.dialog-leave-active {
  @apply transition-opacity duration-300;
}
</style>

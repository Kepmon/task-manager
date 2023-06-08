<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
html {
  @apply bg-light-grey text-black;
}

html.dark {
  @apply bg-very-dark-grey text-white;
}

body {
  @apply min-h-screen text-base font-semibold;
}

::-webkit-scrollbar-corner {
  @apply bg-transparent;
}

.v-select {
  @apply bg-white dark:bg-dark-grey shadow-option rounded-[4px];
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
  @apply box-content p-2 fill-main-purple;
}

.v-select .vs__dropdown-menu {
  @apply absolute top-10 rounded-lg text-sm text-medium-grey;
  @apply bg-white dark:bg-very-dark-grey;
}

.v-select:has(:focus) .vs__dropdown-toggle {
  @apply border-main-purple;
}

.v-select .vs__dropdown-option {
  @apply py-2;
}

.v-select .vs__dropdown-option--highlight {
  @apply bg-main-purple;
}
</style>

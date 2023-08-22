<template>
  <router-view v-slot="{ Component }">
    <transition name="pages" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useDark } from '@vueuse/core'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isDark = useDark()
</script>

<style lang="postcss">
@supports (scrollbar-width: thin) {
  * {
    scrollbar-width: thin;
  }
}

html {
  @apply bg-gray-200 text-black;
}

html.dark {
  @apply bg-gray-800 text-white;
}

body {
  @apply min-h-screen text-base font-semibold;
  @apply scrollbar-visibleLight dark:scrollbar-visibleDark;
}

#app {
  @apply overflow-hidden;
}

button {
  @apply border-none cursor-pointer;
}

button,
[tabindex='0'] {
  @apply outline outline-transparent focus-visible:outline-purple-600 outline-[3px];
}

.regular-button {
  @apply flex items-center grow justify-center gap-2 py-[10px] px-4 rounded-3xl text-sm;
}

.input {
  @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-sm font-normal;
  @apply outline outline-transparent border;
}

.input-error {
  @apply relative after:content-['Can\'t_be_empty'] after:text-sm;
  @apply after:text-red-400 after:font-normal after:absolute;
  @apply after:right-4 after:bottom-1/2 after:translate-y-1/2;
}

::selection {
  @apply bg-purple-400;
}

.purple-class {
  @apply bg-purple-400 hover:bg-purple-600 focus-visible:bg-purple-600;
  @apply text-white outline outline-transparent transition-colors duration-300;
  @apply disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-purple-400;
}

.white-button {
  @apply text-purple-400 bg-purple-320 dark:bg-white;
  @apply hover:bg-purple-200 focus-visible:bg-purple-200;
  @apply transition-colors duration-300 outline outline-transparent;
}

.auth-main {
  @apply grid place-items-center content-center gap-5;
}

.options-container {
  @apply absolute grid bg-white dark:bg-gray-800 rounded-lg shadow-xs z-10;
}

.option {
  @apply py-[7px] s:py-[10px] pl-3 pr-16 text-start text-sm text-gray-400;
  @apply hover:bg-gray-200 dark:hover:bg-gray-500 focus-visible:bg-gray-200 dark:focus-visible:bg-gray-500;
  @apply outline-transparent transition-colors duration-300;
}

.option--delete {
  @apply rounded-b-lg text-red-400;
}

.options-enter-from,
.options-leave-to {
  @apply opacity-0 scale-0 origin-top-right sm:origin-top;
}

.options-enter-active,
.options-leave-active {
  @apply transition-all duration-500;
}

::-webkit-scrollbar-corner {
  @apply bg-transparent;
}

.v-select {
  @apply bg-white dark:bg-gray-700 rounded-[4px];
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
  @apply sticky mt-1 rounded-lg text-sm text-gray-400;
  @apply bg-white dark:bg-gray-800;
}

.v-select .vs__dropdown-toggle {
  @apply shadow-option;
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

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-active,
.modal-leave-active {
  @apply transition-opacity duration-300;
}

.pages-enter-from {
  @apply translate-x-40 opacity-0;
}

.pages-leave-to {
  @apply -translate-x-40 opacity-0;
}

.pages-enter-active,
.pages-leave-active {
  @apply transition-all duration-300;
}
</style>

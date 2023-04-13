<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
*,
*::before,
*::after {
  @apply box-border p-0 m-0;
}

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
  @apply bg-transparent
}
</style>

<template>
  <button
    class="disabled:opacity-75"
    :class="{
      'flex items-center grow justify-center gap-2 py-[10px] px-4 rounded-3xl':
        regularButton,
      'text-sm': isInForm
    }"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  regularButton: boolean
  isInForm?: true
  disabled?: boolean
}>()
</script>

<template>
  <transition name="options">
    <div
      v-if="condition"
      @click="$emit('toggle-options')"
      ref="target"
      class="options-container"
      :class="{
        'right-6 top-[76px]': element === 'board',
        'right-0 -top-4': element === 'task'
      }"
    >
      <button
        @click.prevent="$emit('show-edit-form')"
        class="option option--edit"
      >
        Edit {{ element }}
      </button>
      <button
        @click.prevent="$emit('show-delete-form')"
        class="option option--delete"
      >
        Delete {{ element }}
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

defineProps<{
  condition: boolean
  element: 'task' | 'board'
}>()
const emits = defineEmits([
  'toggle-options',
  'show-edit-form',
  'show-delete-form',
  'close-more-options'
])

const target = ref(null)
onClickOutside(target, (e: Event) => emits('close-more-options', e))
</script>

<style scoped>
.options-container {
  @apply absolute grid w-[150px] md:w-[192px];
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xs z-10;
}

.option {
  @apply block p-[10px] text-start text-sm text-gray-400;
  @apply hover:bg-gray-200 dark:hover:bg-gray-500;
  @apply transition-colors duration-300;
}

.option--edit {
  @apply rounded-t-lg;
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
</style>

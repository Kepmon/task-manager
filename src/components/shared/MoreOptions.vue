<template>
  <transition name="options">
    <div
      v-if="condition"
      @click="toggleOptions"
      ref="target"
      class="options-container"
      :class="{
        'right-6 top-[76px]': element === 'board',
        'right-0 -top-4': element === 'task'
      }"
    >
      <button @click="showEditForm" class="option option--edit">
        Edit {{ element }}
      </button>
      <button @click="showDeleteForm" class="option option--delete">
        Delete {{ element }}
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

const props = defineProps<{
  condition: boolean
  element: 'task' | 'board'
  showEditForm: () => void
  showDeleteForm: () => void
  toggleOptions: (e: Event) => void
  closeMoreOptions: (e: Event) => void
}>()

const target = ref(null)
onClickOutside(target, props.closeMoreOptions)
</script>

<style scoped>
.options-container {
  @apply absolute w-[150px] md:w-[192px] rounded-lg shadow-xs;
  @apply bg-white dark:bg-gray-800 z-10;
}

.option {
  @apply block p-[10px] text-sm text-gray-400 cursor-pointer;
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

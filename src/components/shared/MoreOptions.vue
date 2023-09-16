<template>
  <div
    @click="$emit('toggle-options')"
    id="more-options"
    ref="target"
    class="options-container w-max"
    :class="{
      'right-2 top-[calc(100%+1rem)]': element === 'board',
      'right-3 -top-6': element === 'task',
      '-top-16 right-0': isDashboardEmpty && element === 'auth',
      '-top-16 right-0 sm:top-[74px] sm:right-6':
        !isDashboardEmpty && element === 'auth'
    }"
  >
    <button
      @click="$emit('handle-first-option-click')"
      class="option option--edit"
    >
      {{ element === 'auth' ? 'Log out' : `Edit ${element}` }}
    </button>
    <button
      @click="$emit('handle-second-option-click')"
      class="option option--delete"
    >
      {{ element === 'auth' ? 'Delete account' : `Delete ${element}` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  element: 'task' | 'board' | 'auth'
  isDashboardEmpty?: boolean
}>()
const emits = defineEmits([
  'toggle-options',
  'handle-first-option-click',
  'handle-second-option-click',
  'close-more-options'
])

const target = ref<null | HTMLDivElement>(null)

onClickOutside(target, (e: Event) => emits('close-more-options', e))

const closePopupOnEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emits('close-more-options', e)
  }
}

onMounted(() => {
  window.addEventListener('keydown', closePopupOnEsc)
})
onUnmounted(() => {
  window.removeEventListener('keydown', closePopupOnEsc)
})
</script>

<style lang="postcss" scoped>
.option--edit {
  @apply rounded-t-lg;
}
</style>

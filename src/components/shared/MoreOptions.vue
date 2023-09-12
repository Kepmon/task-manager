<template>
  <transition name="options">
    <div
      v-if="condition"
      @click="$emit('toggle-options')"
      ref="target"
      class="options-container w-max"
      :class="{
        'right-2 top-[calc(100%+1rem)]': element === 'board',
        'right-3 -top-6': element === 'task'
      }"
    >
      <button
        @click.prevent="$emit('show-edit-form')"
        ref="firstButton"
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
import { ref, onMounted, onUnmounted } from 'vue'

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

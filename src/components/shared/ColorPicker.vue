<template>
  <button
    @click="isColorPickerShown = !isColorPickerShown"
    type="button"
    aria-label="click here to choose the color of the dot, displayed next to the column's title"
    data-protected="column-dot"
    class="color-dot-button"
    :style="`background-color: ${startColor};`"
  ></button>

  <transition name="modal">
    <ColorPicker
      v-show="isColorPickerShown"
      @color-change="(color: ColorChangeEvent) => $emit('set-new-color', color)"
      ref="colorPicker"
      :color="startColor"
      class="color-picker"
      :class="noTranslate ? 'left-14 top-7' : 'top-0 left-7 -translate-y-1/2'"
    />
  </transition>
</template>

<script setup lang="ts">
import type { ColorChangeEvent } from 'vue-accessible-color-picker'
import type { MaybeElementRef } from '@vueuse/core'
import { ColorPicker } from 'vue-accessible-color-picker'
import { addStylesToColorPicker } from '../../composables/colorPicker'
import { ref, onMounted, onUnmounted } from 'vue'
import { onClickOutside } from '@vueuse/core'

defineProps<{
  startColor: string
  noTranslate?: true
}>()
const emits = defineEmits([
  'set-show-modal',
  'set-new-color',
  'close-parent-modal'
])

const isColorPickerShown = ref(false)
const colorPicker = ref<null | { $el: HTMLDivElement }>(null)

const closeColorPicker = () => {
  emits('set-show-modal', isColorPickerShown.value)
  isColorPickerShown.value = false
}

const closeColorPickerOnClick = (e: Event) => {
  if (
    (e.target as HTMLElement)
      .closest('button')
      ?.getAttribute('data-protected') === 'column-dot'
  )
    return

  closeColorPicker()
}

const closeColorPickerOnEsc = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return

  if (!isColorPickerShown.value) {
    emits('close-parent-modal')
  }

  if (isColorPickerShown.value) {
    closeColorPicker()
  }
}

onClickOutside(colorPicker as MaybeElementRef, (e: Event) => {
  closeColorPickerOnClick(e)
})

onMounted(() => {
  addStylesToColorPicker(colorPicker.value)
  window.addEventListener('keydown', closeColorPickerOnEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', closeColorPickerOnEsc)
})
</script>

<style lang="postcss" scoped>
.color-dot-button {
  @apply mr-2 relative w-6 aspect-square rounded-full outline-offset-2;
  @apply focus-visible:outline-purple-400 before:absolute before:inset-0;
  @apply before:bg-purple-400 before:rounded-inherit before:-z-10;
  @apply before:animate-ping-once;
}
.color-picker {
  @apply absolute p-3 text-black dark:text-white z-10;
  @apply bg-gray-200 dark:bg-gray-900  rounded-lg;
}
</style>

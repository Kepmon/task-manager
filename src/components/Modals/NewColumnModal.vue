<template>
  <modals-template @close-modal="closeModal" :allowOverflow="true">
    <template #form-title>
      <h2>Add New Column</h2>
    </template>
    <template #main-content>
      <div class="flex items-center gap-4 relative">
        <button
          @click="isColorPickerShown = !isColorPickerShown"
          type="button"
          aria-label="click here to choose the color of the dot, displayed next to the column's title"
          data-protected="column-dot"
          class="w-6 aspect-square rounded-full outline-offset-2 focus-visible:outline-purple-400"
          :style="`background-color: ${startColor};`"
        ></button>
        <transition name="modal">
          <ColorPicker
            v-show="isColorPickerShown"
            @color-change="updateDotColor"
            ref="colorPicker"
            :color="startColor"
            class="color-picker"
          />
        </transition>

        <text-input
          @handle-blur="
            columnName === ''
              ? (isColumnNameError = true)
              : (isColumnNameError = false)
          "
          v-model="columnName"
          label="Column Name"
          idAttr="new-column"
          fieldDescription="column name"
          :isError="isColumnNameError"
          class="grow"
        />
      </div>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { ColorChangeEvent } from 'vue-accessible-color-picker'
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import { ref, onMounted } from 'vue'
import { MaybeElementRef, onClickOutside } from '@vueuse/core'
import { ColorPicker } from 'vue-accessible-color-picker'
import { addStylesToColorPicker } from '../../composables/colorPicker'

const emits = defineEmits(['close-modal'])

const columnName = ref('')
const isColumnNameError = ref(false)

const isColorPickerShown = ref(false)
const colorPicker = ref<null | { $el: HTMLDivElement }>(null)

const startColor = ref('hsl(193 75% 59%)')
const updateDotColor = (color: ColorChangeEvent) => {
  startColor.value = color.cssColor
}

const shouldModalBeClosed = ref(true)
const closeModal = () => {
  if (!shouldModalBeClosed.value) return

  emits('close-modal')
}

onMounted(() => {
  addStylesToColorPicker(colorPicker.value)
})

onClickOutside(colorPicker as MaybeElementRef, (e: Event) => {
  if (
    (e.target as HTMLElement)
      .closest('button')
      ?.getAttribute('data-protected') === 'column-dot'
  )
    return

  if (isColorPickerShown.value) {
    shouldModalBeClosed.value = false
    isColorPickerShown.value = false
    return
  }

  shouldModalBeClosed.value = true
  isColorPickerShown.value = false
})
</script>

<style lang="postcss" scoped>
.color-picker {
  @apply absolute top-0 left-7 p-3 -translate-y-1/2 z-10;
  @apply bg-gray-200 dark:bg-gray-900 text-black dark:text-white rounded-lg;
}
</style>

<template>
  <div class="grid gap-2">
    <p class="text-xs">
      {{ element === 'board' ? 'Columns' : 'Subtasks' }}
    </p>
    <div v-if="formData.data.items.length > 0" class="grid gap-3 isolate">
      <div
        v-for="({ name, id, dotColor }, index) in formData.data.items"
        :key="id"
        class="flex items-center"
      >
        <color-picker
          v-if="element === 'board'"
          @set-new-color="(color: ColorChangeEvent) => setNewColumn(color, index)"
          :startColor="
            formData.data.items[index].dotColor == null
              ? returnCircleColor(index, dotColor, action === 'add')
              : formData.data.items[index].dotColor as string
          "
          :noTranslate="true"
        />
        <text-input
          @handle-blur="formsStore.handleBlur(element, action, index)"
          @update:model-value="(newValue: string) => formData.data.items[index].name = newValue"
          :modelValue="name"
          :placeholder="
            formData.data.placeholderItems
              ? formData.data.placeholderItems[index]
              : undefined
          "
          :condition="formsStore.isNewInputAdded"
          :emptyError="formData.errors.itemsErrors[index].emptyError"
          :tooLongError="formData.errors.itemsErrors[index].tooLongError"
          :fieldDescription="`${formatItemNumber(index + 1)} ${
            element === 'board' ? 'column name' : 'subtask name'
          }`"
          class="grow"
          :nameAttr="
            element === 'board' ? `column${index + 1}` : `subtask${index + 1}`
          "
        ></text-input>
        <close-icon
          @handle-close="() => removeInput(index)"
          :listItem="true"
          :emptyError="formData.errors.itemsErrors[index].emptyError"
          :tooLongError="formData.errors.itemsErrors[index].tooLongError"
        />
      </div>
    </div>
    <p v-else class="text-xs text-gray-400">
      There are no {{ element === 'board' ? 'columns' : 'subtasks' }} to display
    </p>
    <button
      @click="() => formsStore.addNewInput(element, action)"
      aria-labelledby="add-new-element"
      class="mt-4 regular-button white-button"
      type="button"
    >
      <p>
        <span aria-hidden="true">&#65291;</span>
        <span id="add-new-element" aria-hidden="true"
          >Add New {{ element === 'board' ? 'Column' : 'Subtask' }}</span
        >
      </p>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ColorChangeEvent } from 'vue-accessible-color-picker'
import TextInput from './Inputs/TextInput.vue'
import CloseIcon from '../Svgs/CloseIcon.vue'
import ColorPicker from '../shared/ColorPicker.vue'
import { useFormsStore } from '../../stores/forms'
import { returnCircleColor } from '../../composables/circleColor'
import converter from 'number-to-words'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
  element: 'board' | 'task'
}>()
const emits = defineEmits(['handle-blur', 'set-new-color'])

const formsStore = useFormsStore()
const formData = ref(formsStore.formData[props.element][props.action])
const formatItemNumber = (number: number) => converter.toWordsOrdinal(number)

const setNewColumn = (color: ColorChangeEvent, index: number) => {
  if (props.element !== 'board') return
  ;(formData.value.data.items[index].dotColor as string) = color.cssColor

  emits('set-new-color', color, index)
}

const moveFocusFromRemovedInput = (index: number) => {
  const nameAttr = `${props.element === 'board' ? 'board' : 'task'}Title`
  const nameAttrOfSubsetEl = props.element === 'board' ? 'column' : 'subtask'
  const prevSubsetInput = document.querySelector(
    `[name="${nameAttrOfSubsetEl}${index}"]`
  ) as null | HTMLInputElement
  const nextSubsetInput = document.querySelector(
    `[name="${nameAttrOfSubsetEl}${index + 2}"]`
  ) as null | HTMLInputElement

  if (prevSubsetInput != null) {
    prevSubsetInput.focus()
    return
  }

  if (nextSubsetInput != null) {
    nextSubsetInput.focus()
    return
  }

  const titleInput = document.querySelector(
    `[name="${nameAttr}"]`
  ) as null | HTMLInputElement

  if (titleInput != null) {
    titleInput.focus()
  }
}

const removeInput = (index: number) => {
  formsStore.removeInput(props.element, props.action, index)
  moveFocusFromRemovedInput(index)
}
</script>

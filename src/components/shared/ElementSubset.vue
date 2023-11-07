<template>
  <div class="grid gap-2">
    <p class="text-xs">
      {{ element === 'board' ? 'Columns' : 'Subtasks' }}
    </p>
    <div v-if="formData.items.length > 0" class="grid gap-3">
      <div
        v-for="({ name, id, dotColor }, index) in formData.items"
        :key="id"
        class="flex items-center"
      >
        <color-picker
          v-if="element === 'board'"
          @set-new-color="(color: ColorChangeEvent) => setNewColumn(color, index)"
          :startColor="
            buttonColors.length === 0
              ? returnCircleColor(index, dotColor, action === 'add')
              : buttonColors[index]
          "
          :noTranslate="true"
        />
        <text-input
          @handle-blur="
            () =>
              handleFormDataAction({ callback: formsStore.handleBlur, index })
          "
          @update:model-value="(newValue: string) => formData.items[index].name = newValue"
          :modelValue="name"
          :placeholder="
            formData.placeholderItems
              ? formData.placeholderItems[index]
              : undefined
          "
          :isError="formData.errors[index]"
          :condition="formsStore.isNewInputAdded"
          :fieldDescription="`${formatItemNumber(index + 1)} ${
            element === 'board' ? 'column name' : 'subtask name'
          }`"
          class="grow"
          :nameAttr="
            element === 'board' ? `column${index + 1}` : `subtask${index + 1}`
          "
        ></text-input>
        <close-icon
          @handle-close="
            () =>
              handleFormDataAction(
                { callback: formsStore.removeInput, index },
                true
              )
          "
          :listItem="true"
          :isError="formData.errors[index]"
        />
      </div>
    </div>
    <p v-else class="text-xs text-gray-400">
      There are no {{ element === 'board' ? 'columns' : 'subtasks' }} to display
    </p>
    <button
      @click="() => handleFormDataAction({ callback: formsStore.addNewInput })"
      ref="addNewInput"
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
import type { FormData } from '../../api/boardsTypes'
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
const formData = formsStore.formsData[props.element].value[props.action]
const formatItemNumber = (number: number) => converter.toWordsOrdinal(number)

const buttonColors = ref(
  formData.items.map(({ dotColor }) => {
    if (dotColor == null) return 'hsl(193 75% 59%)'

    return dotColor
  })
)
const setNewColumn = (color: ColorChangeEvent, index: number) => {
  buttonColors.value[index] = color.cssColor

  emits('set-new-color', color, index)
}

interface WithIndexArgs {
  callback: (FormData: FormData, index: number) => void
  index: number
}
interface NoIndexArgs {
  callback: (FormData: FormData, buttonColors: string[]) => void
}

const addNewInput = ref<null | HTMLButtonElement>(null)
const handleFormDataAction = <T extends NoIndexArgs | WithIndexArgs>(
  args: T,
  moveFocus?: true
) => {
  if ('index' in args) {
    args.callback(formData, args.index)
  }

  if (!('index' in args)) {
    args.callback(formData, buttonColors.value)
  }

  if (moveFocus && addNewInput.value != null) {
    addNewInput.value.focus()
  }

  emits('handle-blur')
}
</script>

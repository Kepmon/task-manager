<template>
  <div>
    <p class="mb-2 text-xs">
      {{ element === 'board' ? 'Columns' : 'Subtasks' }}
    </p>
    <div v-if="formData.items.length !== 0" class="grid gap-3">
      <div
        v-for="({ name, id }, index) in formData.items"
        :key="id"
        class="flex items-center"
      >
        <text-input
          @handle-blur="() => handleBlur(index)"
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
        ></text-input>
        <close-icon
          @handle-close="() => handleClose(index)"
          :listItem="true"
          :isError="formData.errors[index]"
        />
      </div>
    </div>
    <p v-else class="text-xs text-gray-400">
      There are no {{ element === 'board' ? 'columns' : 'subtasks' }} to display
    </p>
  </div>
  <button
    @click="handleAddInput"
    aria-labelledby="add-new-element"
    class="regular-button white-button"
    type="button"
  >
    <p>
      <span aria-hidden="true">&#65291;</span>
      <span id="add-new-element" aria-hidden="true"
        >Add New {{ element === 'board' ? 'Column' : 'Subtask' }}</span
      >
    </p>
  </button>
</template>

<script setup lang="ts">
import TextInput from './Inputs/TextInput.vue'
import CloseIcon from '../Svgs/CloseIcon.vue'
import { useFormsStore } from '../../stores/forms'
import converter from 'number-to-words'

const props = defineProps<{
  action: 'add' | 'edit'
  element: 'board' | 'task'
}>()
const emits = defineEmits(['handle-blur'])

const formsStore = useFormsStore()
const formData = formsStore.formsData[props.element][props.action]
const formatItemNumber = (number: number) => converter.toWordsOrdinal(number)

const handleBlur = (index: number) => {
  formsStore.handleBlur(formData, index)

  emits('handle-blur')
}

const handleClose = (index: number) => {
  formsStore.removeInput(formData, index)

  emits('handle-blur')
}

const handleAddInput = () => {
  formsStore.addNewInput(formData)

  emits('handle-blur')
}
</script>

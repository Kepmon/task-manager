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
  </div>
  <button
    @click="() => handleFormDataAction({ callback: formsStore.addNewInput })"
    ref="addNewInput"
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
import type { FormData } from '../../api/boardsTypes'
import TextInput from './Inputs/TextInput.vue'
import CloseIcon from '../Svgs/CloseIcon.vue'
import { useFormsStore } from '../../stores/forms'
import converter from 'number-to-words'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
  element: 'board' | 'task'
}>()
const emits = defineEmits(['handle-blur'])

const formsStore = useFormsStore()
const formData = formsStore.formsData[props.element][props.action]
const formatItemNumber = (number: number) => converter.toWordsOrdinal(number)

interface WithIndexArgs {
  callback: (FormData: FormData, index: number) => void
  index: number
}
interface NoIndexArgs {
  callback: (FormData: FormData) => void
}

const addNewInput = ref(null)
const handleFormDataAction = <T extends NoIndexArgs | WithIndexArgs>(
  args: T,
  moveFocus?: true
) => {
  if ('index' in args) {
    args.callback(formData, args.index)
  }

  if (!('index' in args)) {
    args.callback(formData)
  }

  if (moveFocus && addNewInput.value != null) {
    ;(addNewInput.value as HTMLButtonElement).focus()
  }

  emits('handle-blur')
}
</script>

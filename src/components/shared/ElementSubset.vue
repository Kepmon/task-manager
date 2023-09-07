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
          @handle-blur="() => formsStore.handleBlur(formData, index)"
          @update:model-value="(newValue: string) => formData.items[index].name = newValue"
          :modelValue="name"
          :placeholder="
            formData.placeholderItems
              ? formData.placeholderItems[index]
              : undefined
          "
          :isError="formData.errors[index]"
          :condition="formsStore.isNewInputAdded"
          class="grow"
        ></text-input>
        <close-icon
          @handle-close="() => formsStore.removeInput(formData, index)"
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
    @click="() => formsStore.addNewInput(formData)"
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

const props = defineProps<{
  action: 'add' | 'edit'
  element: 'board' | 'task'
}>()
const formsStore = useFormsStore()
const formData = formsStore.formsData[props.element][props.action]
</script>

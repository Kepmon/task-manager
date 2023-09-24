<template>
  <modals-template
    @submit-form="submit"
    @close-modal="$emit('change-var-to-false')"
  >
    <template #form-title>
      <h2 class="first-letter:uppercase">
        {{ action }} {{ action === 'add' ? 'New' : '' }} Board
      </h2>
    </template>

    <template #main-content>
      <text-input
        @handle-blur="() => handleBlur(true)"
        v-model="formName"
        :isError="formNameError"
        label="Board Name"
        fieldDescription="board name"
        idAttr="board-title"
        :placeholder="action === 'add' ? 'e.g. Web Design' : ''"
        :whitePlaceholder="action === 'add' ? false : true"
      />

      <element-subset
        @handle-blur="handleBlur"
        :action="action"
        element="board"
      />

      <button :disabled="isPending" class="regular-button purple-class">
        <span v-if="isPending">Loading...</span>
        <span v-if="!isPending">{{
          action === 'add' ? 'Create New Board' : 'Save Changes'
        }}</span>
      </button>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { Board } from '../../api/boardsTypes'
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import ElementSubset from '../shared/ElementSubset.vue'
import { useBoardsStore } from '../../stores/boards'
import { useFormsStore } from '../../stores/forms'
import { ref, computed } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
}>()
const emits = defineEmits(['update:modelValue', 'change-var-to-false'])

const boardsStore = useBoardsStore()
const formsStore = useFormsStore()

const formName = ref(
  props.action === 'add' ? '' : (boardsStore.currentBoard as Board).name
)
const formNameError = ref(false)
const formSubsetData = computed(() => formsStore.formsData.board[props.action])

const isPending = ref(false)
const handleBlur = (isFormNameInput?: true) => {
  if (isFormNameInput) {
    formName.value === ''
      ? (formNameError.value = true)
      : (formNameError.value = false)
  }
  formsStore.checkFormValidity(formName, formSubsetData)
}
const submit = async () => {
  formsStore.handleFormValidation(formName, formNameError, formSubsetData)

  const invalidInputs = [
    ...document.querySelectorAll('[aria-invalid]')
  ] as HTMLInputElement[]

  if (invalidInputs.length > 0) {
    invalidInputs[0].focus()
  }

  if (!formsStore.isFormValid) return

  isPending.value = true

  const columnNames = formSubsetData.value.items.map(({ name }) => name.trim())

  if (props.action === 'add') {
    await boardsStore.addNewBoard(formName.value.trim(), columnNames)
  }

  if (props.action === 'edit') {
    await boardsStore.editBoard(
      formName.value.trim(),
      formSubsetData.value.items
    )
  }

  emits('change-var-to-false')

  isPending.value = false
}
</script>

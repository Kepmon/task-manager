<template>
  <modals-template @submit-form="submit" @close-modal="handleCloseModal">
    <template #form-title>
      <h2 class="first-letter:uppercase">{{ action }} {{ action === 'add' ? 'New' : '' }} Board</h2>
    </template>

    <template #main-content>
      <text-input
        @handle-blur="
          formName === '' ? (formNameError = true) : (formNameError = false)
        "
        v-model="formName"
        :isError="formNameError"
        label="Board Name"
        forAttr="board-title"
        idAttr="board-title"
        :placeholder="action === 'add' ? 'e.g. Web Design' : ''"
        :whitePlaceholder="action === 'add' ? false : true"
      />

      <element-subset :action="action" element="board" />

      <button :disabled="isPending" class="regular-button purple-class">
        <span v-if="isPending">Loading...</span>
        <span v-if="!isPending" aria-hidden="true">{{
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

const handleCloseModal = () => {
  emits('change-var-to-false')

  formsStore.updateFormData('board')
}

const isPending = ref(false)
const submit = async () => {
  const isFormValid = formsStore.validateForm(
    formName,
    formNameError,
    formSubsetData
  )
  if (!isFormValid) return

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

  formsStore.updateFormData('board')
  isPending.value = false
}
</script>

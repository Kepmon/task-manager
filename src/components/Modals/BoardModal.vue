<template>
  <modals-template @submit-form="submit" @close-modal="handleCloseModal">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Board</h2>
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

      <button class="regular-button purple-class">
        <span aria-hidden="true">{{
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
import { ref } from 'vue'

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
const formSubsetData = formsStore.returnFormSubsetData('task', props.action)

const handleCloseModal = () => {
  emits('change-var-to-false')

  formSubsetData.errors.forEach((err) => {
    err = false
  })
}

const submit = () => {
  const isFormValid = formsStore.validateForm(
    formName,
    formNameError,
    formSubsetData
  )
  if (!isFormValid) return

  emits('change-var-to-false')
  const submitFn =
    props.action === 'add' ? boardsStore.addNewBoard : boardsStore.editBoard

  submitFn(formName.value.trim(), formSubsetData.items as string[])
}
</script>

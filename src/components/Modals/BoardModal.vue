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
        @handle-blur="formsStore.handleBlur('board', action, undefined, true)"
        v-model="formData.data.name"
        :isError="formData.errors.nameError"
        label="Board Name"
        fieldDescription="board name"
        idAttr="board-title"
        :placeholder="action === 'add' ? 'e.g. Web Design' : ''"
        :whitePlaceholder="action === 'add' ? false : true"
        nameAttr="boardTitle"
      />
      <element-subset
        @set-new-color="(color: ColorChangeEvent, index: number) => (formData.data.items[index].dotColor = color.cssColor)"
        :action="action"
        element="board"
      />
      <button :disabled="isPending" class="regular-button purple-class">
        <span v-if="isPending">Loading...</span>
        <span v-else>{{
          action === 'add' ? 'Create New Board' : 'Save Changes'
        }}</span>
      </button>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { ColorChangeEvent } from 'vue-accessible-color-picker'
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

const formData = ref(formsStore.formData.board[props.action])
const isPending = ref(false)

const submit = async () => {
  const isFormValid = formsStore.checkFormValidity('board', props.action)
  if (!isFormValid) return

  const callback = {
    add: async () =>
      await boardsStore.addNewBoard(
        formData.value.data.name.trim(),
        formData.value.data.items.map(({ name }) => name.trim()),
        formData.value.data.items.map(({ dotColor }) => dotColor)
      ),
    edit: async () =>
      await boardsStore.editBoard(
        formData.value.data.name.trim(),
        formData.value.data.items,
        formData.value.data.items.map(({ dotColor }) => dotColor)
      )
  }

  await formsStore.submitForm(
    isPending.value,
    callback[props.action as keyof typeof callback],
    () => emits('change-var-to-false')
  )
}
</script>

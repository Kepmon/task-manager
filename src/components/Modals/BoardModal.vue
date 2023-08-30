<template>
  <modals-template @submit-form="submit" @close-modal="$emit('close-modal')">
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
        :class="{ 'input-error after:translate-y-full': formNameError }"
      />

      <element-subset
        @change-array-item="(emittedValue) => updateColumnValues(emittedValue)"
        :action="action"
        element="board"
      />

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
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
}>()
const emits = defineEmits(['update:modelValue', 'close-modal'])

const boardsStore = useBoardsStore()

const formName = ref(
  props.action === 'add' ? '' : (boardsStore.currentBoard as Board).name
)
const formNameError = ref(false)

const updatedColumns =
  props.action === 'add'
    ? ref(['Todo', 'Doing'])
    : ref(boardsStore.boardColumnsNames)
const updateColumnValues = (emittedValue: string[]) => {
  updatedColumns.value = emittedValue
}

const submit = () => {
  if (
    formName.value === '' ||
    updatedColumns.value?.some((item) => item === '')
  )
    return

  emits('close-modal')
  const submitFn =
    props.action === 'add' ? boardsStore.addNewBoard : boardsStore.editBoard

  submitFn(formName.value.trim(), updatedColumns.value as string[])
}
</script>

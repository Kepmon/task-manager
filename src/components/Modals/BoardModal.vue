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
        @handle-blur="handleNameInputBlur"
        v-model="formName"
        :isError="formNameError"
        label="Board Name"
        fieldDescription="board name"
        idAttr="board-title"
        :placeholder="action === 'add' ? 'e.g. Web Design' : ''"
        :whitePlaceholder="action === 'add' ? false : true"
        nameAttr="boardName"
      />
      <element-subset
        @set-new-color="(color: ColorChangeEvent, index: number) => (columnDotColors[index] = color.cssColor)"
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
const formSubsetData = computed(
  () => formsStore.formsData.board.value[props.action]
)
const columnDotColors = ref(formSubsetData.value.items.map(() => ''))

const isPending = ref(false)
const handleNameInputBlur = () => {
  formName.value === ''
    ? (formNameError.value = true)
    : (formNameError.value = false)
}

const submit = async () => {
  const columnNames = formSubsetData.value.items.map(({ name }) => name.trim())
  const callback = {
    add: async () =>
      await boardsStore.addNewBoard(
        formName.value.trim(),
        columnNames,
        columnDotColors.value
      ),
    edit: async () =>
      await boardsStore.editBoard(
        formName.value.trim(),
        formSubsetData.value.items,
        columnDotColors.value
      )
  }

  handleNameInputBlur()

  await formsStore.submitForm(
    isPending.value,
    callback[props.action as keyof typeof callback],
    () => emits('change-var-to-false')
  )
}
</script>

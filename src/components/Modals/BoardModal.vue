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
        :placeholder="
          action === 'add' ? 'e.g. Web Design' : boardsStore.currentBoard?.name
        "
        :whitePlaceholder="action === 'add' ? false : true"
        :class="{ 'input-error after:translate-y-full': formNameError }"
      />

      <element-subset
        @change-array-item="(emittedValue) => updateColumnValues(emittedValue)"
        :action="action"
        element="board"
      />

      <the-button :regularButton="true" :isInForm="true" class="purple-class">
        {{ action === 'add' ? 'Create New Board' : 'Save Changes' }}
      </the-button>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import TheButton from '../../components/shared/TheButton.vue'
import ElementSubset from '../shared/ElementSubset.vue'
import { useBoardsStore } from '../../stores/boards'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
}>()
const emits = defineEmits(['update:modelValue', 'close-modal'])

const boardsStore = useBoardsStore()

const formName = ref('')
const formNameError = ref(false)

const updatedColumns = ref<null | string[]>(null)
const updateColumnValues = (emittedValue: string[]) => {
  updatedColumns.value = emittedValue
}

const submit = () => {
  if (formName.value === '') return

  emits('close-modal')
  const submitFn =
    props.action === 'add' ? boardsStore.addNewBoard : boardsStore.editBoard

  submitFn(formName.value.trim(), updatedColumns.value as string[])
}
</script>

<template>
  <dialogs-template @submit-form="submit" @close-dialog="$emit('close-dialog')">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Board</h2>
    </template>

    <template #main-content>
      <text-input
        @update:model-value="(newValue: string) => (formData.name = newValue)"
        @handle-blur="
          formData.name === ''
            ? (formNameError = true)
            : (formNameError = false)
        "
        :modelValue="(formData.name as string)"
        :isError="formNameError"
        label="Board Name"
        :placeholder="action === 'add' ? 'e.g. Web Design' : ''"
        :class="{ 'input-error after:translate-y-full': formNameError }"
      />

      <multi-option
        @handle-blur="(data) => (formData.columns = data)"
        @remove-input="(index) => (formData.columns as string[]).splice(index, 1)"
        modifiedItem="board"
        :formType="action"
        :selectedMultiOptionItems="(formData.columns as string[])"
      />

      <the-button
        @click="() => (formData.columns as string[]).push('')"
        :regularButton="true"
        :isInForm="true"
        class="white-button"
        type="button"
      >
        + Add New Column
      </the-button>

      <the-button :regularButton="true" :isInForm="true" class="purple-class">
        {{ action === 'add' ? 'Create New Board' : 'Save Changes' }}
      </the-button>
    </template>
  </dialogs-template>
</template>

<script setup lang="ts">
import type { BoardColumn } from '../../api/boardsTypes'
import DialogsTemplate from './DialogsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import MultiOption from './elements/MultiOption.vue'
import TheButton from '../../components/shared/TheButton.vue'
import { useBoardsNewStore } from '../../stores/boardsNew'
import { ref } from 'vue'

defineProps<{
  action: 'add' | 'edit'
  selectedMultiOptionItems?: BoardColumn['name'][]
}>()
const emits = defineEmits(['close-dialog'])

const { addNewBoard } = useBoardsNewStore()

const formData = ref<Record<'name' | 'columns', string | string[]>>({
  name: '',
  columns: ['Todo', 'Doing']
})
const formNameError = ref(false)

const submit = async () => {
  if (formData.value.name === '') return

  emits('close-dialog')

  await addNewBoard(
    formData.value.name as string,
    formData.value.columns as string[]
  )
}
</script>

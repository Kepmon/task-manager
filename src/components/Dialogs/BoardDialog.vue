<template>
  <dialogs-template @submit-form="submit" @close-dialog="$emit('close-dialog')">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Board</h2>
    </template>

    <template #main-content>
      <text-input
        @handle-blur="
          formData.name === ''
            ? (formNameError = true)
            : (formNameError = false)
        "
        v-model="formData.name"
        :isError="formNameError"
        label="Board Name"
        :placeholder="
          action === 'add'
            ? 'e.g. Web Design'
            : boardsNewStore.currentBoard?.name
        "
        :whitePlaceholder="action === 'add' ? false : true"
        :class="{ 'input-error after:translate-y-full': formNameError }"
      />

      <div v-if="formData.columns.length">
        <p class="mb-2 text-xs">Board Columns</p>
        <div class="grid gap-3">
          <div
            v-for="(item, index) in formData.columns"
            :key="index"
            class="flex items-center"
          >
            <text-input
              @update:model-value="(newValue: string) => ((formData.columns as string[])[index] = newValue)"
              :key="index"
              :modelValue="item"
              :placeholder="action === 'add' ? item : ''"
              :isError="formData.columns[index] === ''"
              :class="{ 'after:content-none': item !== '' }"
              class="input-error grow"
            ></text-input>
            <button
              @click="() => (formData.columns as string[]).splice(index, 1)"
              class="p-2 box-content"
              aria-label="click here to close off this field"
              type="button"
            >
              <svg width="15" height="15">
                <g
                  :class="{
                    'fill-red-400': item === '',
                    'fill-gray-400': item !== ''
                  }"
                >
                  <path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z" />
                  <path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z" />
                </g>
              </svg>
            </button>
          </div>
        </div>
      </div>

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
import TheButton from '../../components/shared/TheButton.vue'
import { useBoardsNewStore } from '../../stores/boardsNew'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
  selectedMultiOptionItems?: BoardColumn['name'][]
}>()
const emits = defineEmits(['update:modelValue', 'close-dialog'])

const boardsNewStore = useBoardsNewStore()

const formData = ref<{ name: string; columns: string[] }>({
  name:
    props.action === 'add' ? '' : (boardsNewStore.currentBoard?.name as string),
  columns:
    props.action === 'add'
      ? ['Todo', 'Doing']
      : (boardsNewStore.boardColumnsNames as string[])
})
const formNameError = ref(false)

const submit = () => {
  if (formData.value.name === '') return

  emits('close-dialog')
  const submitFn =
    props.action === 'add'
      ? boardsNewStore.addNewBoard
      : boardsNewStore.editBoard

  submitFn({
    name: formData.value.name,
    columns: formData.value.columns.map((column) => ({
      name: column,
      tasks: []
    }))
  })
}
</script>

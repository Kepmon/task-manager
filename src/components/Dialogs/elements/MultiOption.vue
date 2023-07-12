<template>
  <div v-if="selectedMultiOptionItems.length !== 0">
    <p class="mb-2 text-xs">
      {{ modifiedItem === 'task' ? 'Subtasks' : 'Board Columns' }}
    </p>

    <div class="flex flex-col gap-3">
      <div
        v-for="(item, index) in selectedMultiOptionItems"
        :key="index"
        class="flex items-center"
      >
        <text-input
          @handle-blur="$emit('handle-blur', columns)"
          @update:model-value="(newValue: string) => (columns[index] = newValue)"
          :modelValue="columns[index]"
          :placeholder="
            modifiedItem === 'task' && formType === 'add' ? item : ''
          "
          :isError="columns[index] === ''"
          :class="{ 'after:content-none': item !== '' }"
          class="input-error grow"
        />
        <button
          @click="$emit('remove-input', index)"
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
</template>

<script setup lang="ts">
import type { Subtask, BoardColumn } from '../../../api/boardsTypes'
import TextInput from '../../shared/Inputs/TextInput.vue'
import { ref } from 'vue'

defineProps<{
  modifiedItem: 'task' | 'board'
  formType: 'add' | 'edit'
  selectedMultiOptionItems:
    | Subtask['title'][]
    | BoardColumn['name'][]
    | string[]
}>()
defineEmits(['handle-blur', 'remove-input'])

const columns = ref(['Todo', 'Doing'])
</script>

<template>
  <modals-template @close-modal="$emit('close-modal')">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Task</h2>
    </template>

    <template #main-content>
      <text-input
        v-model="taskTitle"
        label="Title"
        :placeholder="action === 'add' ? 'e.g. Take coffee break' : ''"
      />

      <description-field label="Description" />

      <div>
        <p class="mb-2 text-xs">Subtasks</p>
        <div class="grid gap-3">
          <div
            v-for="(item, index) in boardsStore.boardColumnsNames"
            :key="index"
            class="flex items-center"
          >
            <text-input
              :key="index"
              :modelValue="item"
              :placeholder="action === 'add' ? item : ''"
              :class="{ 'after:content-none': item !== '' }"
              class="input-error grow"
            ></text-input>
            <button
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

      <the-button :regularButton="true" :isInForm="true" class="white-button">
        + Add New Subtask
      </the-button>

      <div>
        <p class="mb-2 text-xs text-gray-400 dark:text-white">Status</p>
        <v-select
          :options="statusItems"
          :searchable="false"
          placeholder="Todo"
        ></v-select>
      </div>

      <the-button :regularButton="true" :isInForm="true" class="purple-class">
        {{ action === 'add' ? 'Create Task' : 'Save Changes' }}
      </the-button>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { BoardColumn, Subtask } from '../../api/boardsTypes'
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import DescriptionField from '../shared/Inputs/DescriptionField.vue'
import TheButton from '../../components/shared/TheButton.vue'
import { ref } from 'vue'

defineProps<{
  action: 'add' | 'edit'
  selectedMultiOptionItems: Subtask['title'][] | string[]
}>()
defineEmits(['close-modal'])

const taskTitle = ref('')
const statusItems = ref<BoardColumn['name'][]>([])
</script>
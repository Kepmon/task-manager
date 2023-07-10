<template>
  <dialogs-template @close-dialog="$emit('close-dialog')">
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

      <multi-option
        modifiedItem="task"
        :formType="action"
        :selectedMultiOptionItems="selectedMultiOptionItems"
      />

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
  </dialogs-template>
</template>

<script setup lang="ts">
import type { BoardColumn, Subtask } from '../../api/boardsTypes'
import DialogsTemplate from './DialogsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import DescriptionField from '../shared/Inputs/DescriptionField.vue'
import MultiOption from './elements/MultiOption.vue'
import TheButton from '../../components/shared/TheButton.vue'
import { useBoardsNewStore } from '../../stores/boardsNew'
import { ref, toRefs, onMounted } from 'vue'

defineProps<{
  action: 'add' | 'edit'
  selectedMultiOptionItems: Subtask['title'][] | string[]
}>()
defineEmits(['close-dialog'])

const taskTitle = ref('')
const statusItems = ref<BoardColumn['name'][]>([])
onMounted(() => {
  const { currentBoard } = toRefs(useBoardsNewStore())
  statusItems.value = currentBoard.value.columns.map((column) => column.name)
})
</script>

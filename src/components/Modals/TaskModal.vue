<template>
  <modals-template @submit-form="submit" @close-modal="$emit('close-modal')">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Task</h2>
    </template>

    <template #main-content>
      <text-input
        @handle-blur="
          formName === '' ? (formNameError = true) : (formNameError = false)
        "
        v-model="formName"
        forAttr="task-title"
        idAttr="task-title"
        :isError="formNameError"
        label="Title"
        :placeholder="action === 'add' ? 'e.g. Take coffee break' : ''"
        :whitePlaceholder="action === 'add' ? false : true"
        :class="{ 'input-error after:translate-y-full': formNameError }"
      />

      <description-field
        v-model="taskDescription"
        label="Description"
        forAttr="task-description"
        idAttr="task-description"
        :whitePlaceholder="action === 'add' ? false : true"
      />

      <element-subset
        @change-array-item="(emittedValue) => updateSubtaskValues(emittedValue)"
        :action="action"
        element="task"
      />

      <div>
        <p class="mb-2 text-xs text-gray-400 dark:text-white">Status</p>
        <v-select
          @update:model-value="
            (newItem: string) => (selectedStatusItem = (boardsStore.boardColumns).find((item) => item.name === newItem) as BoardColumn)
          "
          :options="statusItemsNames"
          :searchable="false"
          :placeholder="selectedStatusItem.name"
        ></v-select>
      </div>

      <the-button :regularButton="true" :isInForm="true" class="purple-class">
        <span aria-hidden="true">{{
          action === 'add' ? 'Create Task' : 'Save Changes'
        }}</span>
      </the-button>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { BoardColumn, Task, Subtask } from '../../api/boardsTypes'
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import DescriptionField from '../shared/Inputs/DescriptionField.vue'
import TheButton from '../../components/shared/TheButton.vue'
import ElementSubset from '../shared/ElementSubset.vue'
import { useBoardsStore } from '../../stores/boards'
import { useTasksStore } from '../../stores/tasks'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
  columnIndex?: number
  task?: Task
  subtasks?: Subtask[]
}>()
const emits = defineEmits(['close-modal'])

const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()

const formName = ref(props.task != null ? props.task.title : '')
const formNameError = ref(false)
const taskDescription = ref(props.task != null ? props.task.description : '')

const selectedStatusItem = ref(
  props.columnIndex != null
    ? boardsStore.boardColumns[props.columnIndex]
    : boardsStore.boardColumns[0]
)
const statusItemsNames = boardsStore.boardColumns?.map((column) => column.name)

const updatedSubtasks = ref(['', ''])
const updateSubtaskValues = (emittedValue: string[]) => {
  updatedSubtasks.value = emittedValue
}

const submit = async () => {
  if (
    formName.value === '' ||
    updatedSubtasks.value?.some((item) => item === '')
  )
    return

  emits('close-modal')
  await tasksStore.addNewTask(
    selectedStatusItem.value.columnID as BoardColumn['columnID'],
    {
      title: formName.value.trim(),
      description: taskDescription.value.trim()
    },
    updatedSubtasks.value as string[]
  )
  await boardsStore.getColumns()
}
</script>

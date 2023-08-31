<template>
  <modals-template @submit-form="submit" @close-modal="handleCloseModal">
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

      <element-subset :action="action" element="task" />

      <div>
        <p class="mb-2 text-xs text-gray-400 dark:text-white">Status</p>
        <v-select
          @update:model-value="(newItem: BoardColumn['name']) => updateStatusItem(newItem)"
          :options="statusItemsNames"
          :searchable="false"
          :placeholder="selectedStatusItem.name"
        ></v-select>
      </div>

      <button class="regular-button purple-class">
        <span aria-hidden="true">{{
          action === 'add' ? 'Create Task' : 'Save Changes'
        }}</span>
      </button>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { BoardColumn, Task, Subtask } from '../../api/boardsTypes'
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import DescriptionField from '../shared/Inputs/DescriptionField.vue'
import ElementSubset from '../shared/ElementSubset.vue'
import { useBoardsStore } from '../../stores/boards'
import { useTasksStore } from '../../stores/tasks'
import { useFormsStore } from '../../stores/forms'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
  columnIndex?: number
  task?: Task
  subtasks?: Subtask[]
}>()
const emits = defineEmits(['change-var-to-false'])

const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()
const formsStore = useFormsStore()

const formName = ref(props.task != null ? props.task.title : '')
const formNameError = ref(false)
const taskDescription = ref(props.task != null ? props.task.description : '')
const formSubsetData = formsStore.returnFormSubsetData('task', props.action)

const selectedStatusItem = ref(
  props.columnIndex != null
    ? boardsStore.boardColumns[props.columnIndex]
    : boardsStore.boardColumns[0]
)
const statusItemsNames = boardsStore.boardColumns?.map((column) => column.name)
const prevStatusItem = ref<null | BoardColumn>(null)

const isStatusUpdated = ref(false)
const updateStatusItem = (newItem: BoardColumn['name']) => {
  isStatusUpdated.value = true

  prevStatusItem.value = boardsStore.boardColumns.find(
    (item) => item.name === selectedStatusItem.value.name
  ) as BoardColumn

  selectedStatusItem.value = boardsStore.boardColumns.find(
    (item) => item.name === newItem
  ) as BoardColumn
}

const handleCloseModal = () => {
  emits('change-var-to-false')

  if (props.action != null) {
    formSubsetData.errors.forEach((err) => {
      err = false
    })
  }
}

const submit = async () => {
  const isFormValid = formsStore.validateForm(
    formName,
    formNameError,
    formSubsetData
  )
  if (!isFormValid) return

  emits('change-var-to-false')

  if (props.action === 'add') {
    await tasksStore.addNewTask(
      selectedStatusItem.value.columnID as BoardColumn['columnID'],
      {
        title: formName.value.trim(),
        description: taskDescription.value.trim()
      },
      formSubsetData.items
    )
  }

  if (props.action === 'edit') {
    await tasksStore.editTask(
      formName.value,
      taskDescription.value,
      formSubsetData.items,
      prevStatusItem.value?.columnID,
      selectedStatusItem.value.columnID,
      isStatusUpdated.value
    )
  }

  await boardsStore.getColumns()
}
</script>

<template>
  <modals-template
    @submit-form="submit"
    @close-modal="$emit('change-var-to-false')"
  >
    <template #form-title>
      <h2 class="first-letter:uppercase">
        {{ action }} {{ action === 'add' ? 'New' : '' }} Task
      </h2>
    </template>

    <template #main-content>
      <text-input
        @handle-blur="handleNameInputBlur"
        v-model="formName"
        idAttr="task-title"
        :isError="formNameError"
        label="Title"
        fieldDescription="task title"
        :placeholder="action === 'add' ? 'e.g. Take coffee break' : ''"
        :whitePlaceholder="action === 'add' ? false : true"
        nameAttr="taskTitle"
      />

      <description-field
        v-model="taskDescription"
        label="Description"
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

      <button :disabled="isPending" class="regular-button purple-class">
        <span v-if="isPending">Loading...</span>
        <span v-if="!isPending">{{
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
import { ref, computed } from 'vue'

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
const formSubsetData = computed(
  () => formsStore.formsData.task.value[props.action]
)

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

const isPending = ref(false)
const handleNameInputBlur = () => {
  formName.value === ''
    ? (formNameError.value = true)
    : (formNameError.value = false)
}

const submit = async () => {
  const subtaskNames = formSubsetData.value.items.map(({ name }) => name.trim())
  const callback = {
    add: async () =>
      await tasksStore.addNewTask(
        selectedStatusItem.value.columnID as BoardColumn['columnID'],
        {
          title: formName.value.trim(),
          description: taskDescription.value.trim()
        },
        subtaskNames
      ),
    edit: async () =>
      await tasksStore.editTask(
        formName.value,
        taskDescription.value,
        formSubsetData.value.items,
        selectedStatusItem.value.columnID,
        isStatusUpdated.value
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

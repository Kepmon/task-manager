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
        @handle-blur="formsStore.handleBlur('task', action)"
        v-model="formData.data.name"
        :emptyError="formData.errors.nameError.emptyError"
        :tooLongError="formData.errors.nameError.tooLongError"
        idAttr="task-title"
        label="Title"
        fieldDescription="task title"
        :placeholder="action === 'add' ? 'e.g. Take coffee break' : ''"
        :whitePlaceholder="action === 'add' ? false : true"
        nameAttr="taskTitle"
      />

      <description-field
        v-if="formData.data.description != null"
        v-model="formData.data.description"
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
import type { BoardColumn, Task } from '../../api/boardsTypes'
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import DescriptionField from '../shared/Inputs/DescriptionField.vue'
import ElementSubset from '../shared/ElementSubset.vue'
import { useUserStore } from '../../stores/user'
import { useTasksStore } from '../../stores/tasks'
import { useFormsStore } from '../../stores/forms'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
  columnIndex?: number
  task?: Task
}>()
const emits = defineEmits(['change-var-to-false'])

const userStore = useUserStore()
const tasksStore = useTasksStore()
const formsStore = useFormsStore()

const formData = formsStore.formData.task[props.action]
const boardColumns = userStore.userData.currentBoard.boardColumns

const selectedStatusItem = ref(
  props.columnIndex != null ? boardColumns[props.columnIndex] : boardColumns[0]
)
const statusItemsNames = boardColumns?.map((column) => column.name)
const prevStatusItem = ref<null | BoardColumn>(null)

const isStatusUpdated = ref(false)
const updateStatusItem = (newItem: BoardColumn['name']) => {
  isStatusUpdated.value = true

  prevStatusItem.value = boardColumns.find(
    (item) => item.name === selectedStatusItem.value.name
  ) as BoardColumn

  selectedStatusItem.value = boardColumns.find(
    (item) => item.name === newItem
  ) as BoardColumn
}

const isPending = ref(false)

const submit = async () => {
  const isFormValid = formsStore.checkFormValidity('task', props.action)
  if (!isFormValid) return

  const callback = {
    add: async () =>
      await tasksStore.addNewTask(
        selectedStatusItem.value.columnID as BoardColumn['columnID']
      ),
    edit: async () =>
      await tasksStore.editTask(
        selectedStatusItem.value.columnID,
        isStatusUpdated.value
      )
  }

  await formsStore.submitForm(
    isPending.value,
    callback[props.action as keyof typeof callback],
    () => emits('change-var-to-false')
  )

  formsStore.resetFormData('task', props.action)
}
</script>

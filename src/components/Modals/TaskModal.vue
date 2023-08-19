<template>
  <modals-template @submit-form="submit" @close-modal="$emit('close-modal')">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Task</h2>
    </template>

    <template #main-content>
      <text-input
        @handle-blur="
          taskFormData.title === ''
            ? (formNameError = true)
            : (formNameError = false)
        "
        v-model="taskFormData.title"
        :isError="formNameError"
        label="Title"
        :placeholder="action === 'add' ? 'e.g. Take coffee break' : ''"
        :whitePlaceholder="action === 'add' ? false : true"
        :class="{ 'input-error after:translate-y-full': formNameError }"
      />

      <description-field
        v-model="taskFormData.description"
        label="Description"
        :whitePlaceholder="action === 'add' ? false : true"
      />

      <div>
        <p class="mb-2 text-xs">Subtasks</p>
        <div class="grid gap-3">
          <div
            v-for="(item, index) in taskFormData.subtasks"
            :key="index"
            class="flex items-center"
          >
            <text-input
              @handle-blur="
                () =>
                  item === ''
                    ? (subtasksErrors[index] = true)
                    : (subtasksErrors[index] = false)
              "
              @update:model-value="(newValue: string) => taskFormData.subtasks[index] = newValue"
              :modelValue="item"
              :placeholder="action === 'add' ? item : ''"
              :isError="subtasksErrors[index]"
              :condition="
                index === taskFormData.subtasks.length - 1 && isNewInputAdded
              "
              class="grow"
              :class="{
                'input-error': subtasksErrors[index] === true
              }"
            ></text-input>
            <close-icon
              @handle-close="() => (taskFormData.subtasks as string[]).splice(index, 1)"
              :listItem="item"
              :isError="subtasksErrors[index]"
            />
          </div>
        </div>
      </div>

      <the-button
        @click="addNewSubtaskInput"
        :regularButton="true"
        :isInForm="true"
        type="button"
        class="white-button"
      >
        + Add New Subtask
      </the-button>

      <div>
        <p class="mb-2 text-xs text-gray-400 dark:text-white">Status</p>
        <v-select
          @update:model-value="
            (newItem: string) => (taskFormData.selectedStatusItem = (taskFormData.statusItems as BoardColumn[]).filter((item) => item.name === newItem)[0])
          "
          :options="statusItemsNames"
          :searchable="false"
          :placeholder="taskFormData.selectedStatusItem.name"
        ></v-select>
      </div>

      <the-button :regularButton="true" :isInForm="true" class="purple-class">
        {{ action === 'add' ? 'Create Task' : 'Save Changes' }}
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
import CloseIcon from '../Svgs/CloseIcon.vue'
import { addNewInput } from '../../composables/addNewInput'
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

const boardsStore = useBoardsStore()
const statusItemsNames = boardsStore.boardColumns?.map((column) => column.name)

const taskFormData = ref({
  title: props.task != null ? props.task.title : '',
  description: props.task != null ? props.task.description : '',
  subtasks:
    props.subtasks != null
      ? props.subtasks.map((subtask) => subtask.title)
      : ['e.g. Make coffee', 'e.g. Drink coffee & smile'],
  statusItems: boardsStore.boardColumns,
  selectedStatusItem:
    props.columnIndex != null
      ? boardsStore.boardColumns[props.columnIndex]
      : boardsStore.boardColumns[0]
})
const formNameError = ref(false)
const subtasksErrors = ref(taskFormData.value.subtasks.map(() => false))
const isNewInputAdded = ref(false)

const addNewSubtaskInput = () => {
  addNewInput(taskFormData, subtasksErrors, isNewInputAdded)
}

const tasksStore = useTasksStore()
const submit = async () => {
  emits('close-modal')
  await tasksStore.addNewTask(
    taskFormData.value.selectedStatusItem.columnID as BoardColumn['columnID'],
    {
      title: taskFormData.value.title.trim(),
      description: taskFormData.value.description.trim()
    },
    taskFormData.value.subtasks
  )
  await boardsStore.getColumns()
}
</script>

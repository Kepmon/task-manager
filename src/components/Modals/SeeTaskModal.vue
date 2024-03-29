<template>
  <modals-template @close-modal="$emit('close-modal')">
    <template #form-title>
      <h2>{{ task.title }}</h2>
    </template>

    <template #ellipsis>
      <more-options-icon
        @toggle-options="areTaskOptionsShown = !areTaskOptionsShown"
        element="task"
        :expandedCondition="areTaskOptionsShown"
      />
    </template>

    <template #main-content>
      <div class="grid gap-6 relative">
        <transition name="options">
          <more-options
            v-if="areTaskOptionsShown"
            @toggle-options="(e: Event) => handleMoreOptionsFn(e, toggleOptions)"
            @handle-first-option-click="$emit('show-edit-form')"
            @handle-second-option-click="$emit('show-delete-form')"
            @close-more-options="(e: Event) => handleMoreOptionsFn(e, closeOptions)"
            element="task"
          />
        </transition>

        <p v-if="task.description" class="text-gray-400 text-xs xs::text-sm">
          {{ task.description }}
        </p>

        <div>
          <p class="mb-4 text-xs text-gray-400 dark:text-white">
            Subtasks
            <span v-if="subtasksOfClickedTask.length > 0">
              ({{
                subtasksOfClickedTask.filter((subtask) => subtask.isCompleted)
                  .length
              }}
              of {{ subtasksOfClickedTask.length }})
            </span>
          </p>
          <p
            v-if="subtasksOfClickedTask.length === 0"
            class="text-xs text-gray-400"
          >
            There are no subtasks to display
          </p>
          <div v-if="subtasksOfClickedTask.length > 0" class="grid gap-2">
            <div
              @click="() => toggleSubtask(subtaskID)"
              v-for="{ title, isCompleted, subtaskID } in subtasksOfClickedTask"
              :key="subtaskID"
              class="subtask"
            >
              <input
                :id="subtaskID"
                type="checkbox"
                :checked="isCompleted"
                class="checkbox peer"
              />
              <label
                @click.prevent
                :for="subtaskID"
                class="text-xs peer-checked:line-through peer-checked:opacity-50"
                >{{ title }}</label
              >
            </div>
          </div>
        </div>

        <div>
          <p class="mb-2 text-xs text-gray-400 dark:text-white">
            Current Status
          </p>
          <v-select
            @update:model-value="(newColumnName: BoardColumn['name']) => handleChangeColumn(newColumnName)"
            :options="taskStatusesNames"
            :searchable="false"
            :placeholder="taskStatusesNames[columnIndex || 0]"
          ></v-select>
          <p v-if="isPending" class="mt-4 text-purple-400 text-center">
            Loading...
          </p>
        </div>
      </div>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { BoardColumn, Task } from '../../api/boardsTypes'
import type { Ref } from 'vue'
import ModalsTemplate from './ModalsTemplate.vue'
import MoreOptions from '../shared/MoreOptions.vue'
import MoreOptionsIcon from '../Svgs/MoreOptionsIcon.vue'
import toggleMoreOptions from '../../composables/toggleMoreOptions'
import { handleResponse } from '../../composables/responseHandler'
import { useUserStore } from '../../stores/user'
import { useTasksStore } from '../../stores/tasks'
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps<{
  columnIndex: null | number
  task: Task
}>()
const emits = defineEmits([
  'close-modal',
  'show-edit-form',
  'show-delete-form',
  'handle-move-task'
])

const userStore = useUserStore()
const tasksStore = useTasksStore()

const subtasksOfClickedTask = computed(
  () => userStore.userData.currentBoard.subtasksOfClickedTask
)

const taskStatusesNames = computed(() =>
  userStore.userData.currentBoard.boardColumns.map((column) => column.name)
)
const areTaskOptionsShown = ref(false)

const { toggleOptions, closeOptions } = toggleMoreOptions
const handleMoreOptionsFn = (
  e: Event,
  cb: (
    e: Event,
    conditionToChange: Ref<boolean>,
    protectedElement: string
  ) => void
) => {
  cb(e, areTaskOptionsShown, 'ellipsis')
}

const toggleSubtask = async (id: string) => {
  const clickedSubtask = subtasksOfClickedTask.value.find(
    ({ subtaskID }) => id === subtaskID
  )

  if (clickedSubtask != null) {
    const response = await tasksStore.toggleSubtask(clickedSubtask)

    handleResponse(response)
  }
}

const isPending = ref(false)
const handleChangeColumn = async (newColumnName: BoardColumn['name']) => {
  isPending.value = true

  const newColumnIndex = userStore.userData.currentBoard.boardColumns.findIndex(
    ({ name }) => name === newColumnName
  )
  const boardTasks = userStore.userData.currentBoard.boardTasks
  const clickedTask = userStore.userData.currentBoard.clickedTask

  if (
    clickedTask != null &&
    props.columnIndex != null &&
    newColumnIndex != null &&
    clickedTask != null
  ) {
    const response = await tasksStore.moveTaskBetweenColumns(
      props.columnIndex,
      newColumnIndex,
      clickedTask,
      boardTasks[props.columnIndex].length,
      clickedTask.taskIndex - 1
    )
    handleResponse(response)

    emits('handle-move-task')
  }
}

onUnmounted(() => {
  isPending.value = false
})
</script>

<style lang="postcss" scoped>
.checkbox {
  @apply appearance-none after:flex after:items-center after:justify-center;
  @apply after:pb-[2px] after:h-3 after:w-3 after:bg-white after:shadow-option;
  @apply after:rounded-[2px] checked:after:bg-purple-400 checked:after:content-checked;
}

.subtask {
  @apply flex items-center gap-2 p-2 rounded bg-blue-200 dark:bg-gray-800;
  @apply hover:bg-purple-310 hover:dark:bg-purple-310 cursor-pointer;
  @apply transition-colors duration-300;
}
</style>

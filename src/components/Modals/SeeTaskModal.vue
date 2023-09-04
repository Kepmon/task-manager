<template>
  <modals-template @close-modal="$emit('close-modal')">
    <template #form-title>
      <h2>{{ task.title }}</h2>
    </template>

    <template #ellipsis>
      <more-options-icon
        @toggle-options="areTaskOptionsShown = !areTaskOptionsShown"
        element="task"
      />
    </template>

    <template #main-content>
      <div class="grid gap-6 relative">
        <more-options
          @toggle-options="(e: Event) => handleMoreOptionsFn(e, toggleOptions)"
          @show-edit-form="$emit('show-edit-form')"
          @show-delete-form="$emit('show-delete-form')"
          @close-more-options="(e: Event) => handleMoreOptionsFn(e, closeOptions)"
          :condition="areTaskOptionsShown"
          element="task"
        />

        <p class="text-gray-400 text-xs xs::text-sm">
          {{ task.description }}
        </p>

        <div v-if="tasksStore.subtasksOfClickedTask != null">
          <p class="mb-4 text-xs text-gray-400 dark:text-white">
            Subtasks ({{
              tasksStore.subtasksOfClickedTask.filter(
                (subtask) => subtask.isCompleted
              ).length
            }}
            of {{ tasksStore.subtasksOfClickedTask.length }})
          </p>
          <div
            @click="() => toggleSubtask(index)"
            v-for="(
              { title, isCompleted, subtaskID }, index
            ) in tasksStore.subtasksOfClickedTask"
            :key="subtaskID"
            class="subtask"
          >
            <label class="flex items-center gap-4 px-1 cursor-pointer">
              <input
                type="checkbox"
                :checked="isCompleted"
                class="checkbox peer"
              />
              <span
                class="text-xs peer-checked:line-through peer-checked:opacity-50"
              >
                {{ title }}
              </span>
            </label>
          </div>
        </div>

        <div>
          <p class="mb-2 text-xs text-gray-400 dark:text-white">
            Current Status
          </p>
          <v-select
            @update:model-value="
              (newColumnName: BoardColumn['name']) => $emit('handle-move-task', newColumnName)
            "
            :options="taskStatuses"
            :searchable="false"
            :placeholder="taskStatuses[columnIndex]"
          ></v-select>
        </div>
      </div>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { BoardColumn, Task, Subtask } from '../../api/boardsTypes'
import ModalsTemplate from './ModalsTemplate.vue'
import MoreOptions from '../shared/MoreOptions.vue'
import MoreOptionsIcon from '../Svgs/MoreOptionsIcon.vue'
import moreOptionsPopup from '../../composables/moreOptionsPopup'
import { useTasksStore } from '../../stores/tasks'
import { useBoardsStore } from '../../stores/boards'
import type { Ref } from 'vue'
import { ref } from 'vue'

defineProps<{
  columnIndex: number
  task: Task
}>()
defineEmits([
  'close-modal',
  'show-edit-form',
  'show-delete-form',
  'handle-move-task'
])

const tasksStore = useTasksStore()
const boardsStore = useBoardsStore()

const taskStatuses = ref(boardsStore.boardColumns.map((column) => column.name))
const areTaskOptionsShown = ref(false)

const { toggleOptions, closeOptions } = moreOptionsPopup
const handleMoreOptionsFn = (
  e: Event,
  cb: (e: Event, conditionToChange: Ref<boolean>) => void
) => {
  cb(e, areTaskOptionsShown)
}

const toggleSubtask = async (index: number) => {
  const clickedSubtask = (tasksStore.subtasksOfClickedTask as Subtask[])[index]

  await tasksStore.toggleSubtask(clickedSubtask)
  await boardsStore.getColumns()
}
</script>

<style lang="postcss" scoped>
.checkbox {
  @apply appearance-none after:flex after:items-center after:justify-center;
  @apply after:pb-[2px] after:h-3 after:w-3 after:bg-white after:shadow-option;
  @apply after:rounded-[2px] checked:after:bg-purple-400 checked:after:content-checked;
}

.subtask {
  @apply [&:not(:last-of-type)]:mb-2 p-2 rounded bg-blue-200 dark:bg-gray-800;
  @apply hover:bg-purple-320 hover:dark:bg-purple-320;
  @apply transition-colors duration-300;
}
</style>

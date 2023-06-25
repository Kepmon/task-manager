<template>
  <div class="columns-container" :class="{ 'columns-container--sizes': !logo }">
    <div class="flex gap-6 h-max">
      <div v-for="column in columns" :key="column.name" class="flex flex-col">
        <div class="flex items-center gap-2 mb-8">
          <div
            class="h-[15px] w-[15px] rounded-full"
            :class="circleColor(column)"
          ></div>
          <p class="text-xs text-gray-400 uppercase">
            {{ column.name }} ({{ column.tasks.length }})
          </p>
        </div>
        <task-card
          @change-task-title="(title) => (clickedTitle = title)"
          v-for="{ title } in column.tasks"
          :key="title"
          :howManyCompleted="returnNumberOfCompletedSubtasks(subtasks)"
          :howManySubtasks="subtasks.length"
          :title="title"
          :isClickedTask="clickedTitle === title"
        />
      </div>
      <div class="new-column group" tabindex="0">
        <span class="new-column-text">+ New Column</span>
      </div>
    </div>
    <Teleport to="body">
      <transition name="dialog">
        <see-task-dialog
          v-if="clickedTitle != null"
          @close-dialog="closeSeeTask"
          @show-edit-form="showEditForm"
          @show-delete-form="showDeleteForm"
        />
      </transition>
    </Teleport>
    <transition name="dialog">
      <confirmation-dialog
        v-if="isDeleteTaskDialogShown"
        @close-dialog="isDeleteTaskDialogShown = false"
        elementToDelete="task"
        elementName="Research pricing points of various competitors and trial different business models"
      />
    </transition>
    <transition name="dialog">
      <task-dialog
        v-if="isEditTaskDialogShown"
        @close-dialog="isEditTaskDialogShown = false"
        action="edit"
        :selectedMultiOptionItems="selectedMultiOptionItems"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { BoardColumn, Task } from '../api/boardsTypes'
import TaskCard from './TaskCard.vue'
import SeeTaskDialog from './Dialogs/SeeTaskDialog.vue'
import ConfirmationDialog from '../components/Dialogs/ConfirmationDialog.vue'
import TaskDialog from '../components/Dialogs/TaskDialog.vue'
import { useBoardsStore } from '../stores/boards'
import { computed, ref, Ref } from 'vue'

const props = defineProps<{
  columns: BoardColumn[]
  logo: boolean
}>()

const circleColor = computed(() => {
  return (column: BoardColumn) => ({
    'bg-blue-600': props.columns.indexOf(column) % 3 === 0,
    'bg-blue-500': props.columns.indexOf(column) % 3 === 1,
    'bg-green-400': props.columns.indexOf(column) % 3 === 2
  })
})

const clickedTitle: Ref<null | Task['title']> = ref(null)

const isEditTaskDialogShown = ref(false)
const isDeleteTaskDialogShown = ref(false)
const { subtasks, returnNumberOfCompletedSubtasks } = useBoardsStore()
const selectedMultiOptionItems = subtasks.map((subtask) => subtask.title)

const closeSeeTask = () => {
  clickedTitle.value = null
}

const showEditForm = () => {
  isEditTaskDialogShown.value = true
  closeSeeTask()
}

const showDeleteForm = () => {
  isDeleteTaskDialogShown.value = true
  closeSeeTask()
}
</script>

<style scoped>
.columns-container {
  @apply h-full overflow-auto;
  @apply scrollbar-invisible hover:scrollbar-visibleLight dark:hover:scrollbar-visibleDark;
}

.columns-container--sizes {
  @apply w-[calc(100vw-32px)] sm:w-[calc(67vw-48px)];
  @apply lg:w-[calc(75vw-48px)] xl:w-[calc(80vw-48px)];
}

.new-column {
  @apply flex items-center justify-center mt-[44px]  min-w-[280px] shadow-column;
  @apply bg-gradient-to-b from-blue-100 to-blue-80 cursor-pointer;
  @apply dark:from-gray-700 dark:to-gray-680;
}

.new-column-text {
  @apply flex p-2 text-gray-400 text-xl group-hover:text-purple-400;
  @apply group-focus:text-purple-400 transition-colors duration-300;
}
</style>

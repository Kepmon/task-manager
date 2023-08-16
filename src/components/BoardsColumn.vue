<template>
  <div class="columns-container" :class="{ 'columns-container--sizes': !logo }">
    <div class="flex gap-6 h-full">
      <div
        v-for="(column, columnIndex) in boardsStore.boardColumns"
        :key="columnIndex"
      >
        <div
          class="flex items-center gap-2 py-room-for-outline mb-4 min-w-[280px]"
        >
          <div
            class="h-[15px] w-[15px] rounded-full"
            :class="circleColor ? circleColor(column) : ''"
          ></div>
          <p class="text-xs text-gray-400 uppercase">
            {{ column.name }} ({{
              returnNumberOfElements(columnIndex, 0, 'tasks')
            }})
          </p>
          <close-icon
            @handle-close="() => handleDeleteIconClick(column)"
            :isColumn="true"
          />
        </div>
        <task-card
          @click="() => handleTaskCardClick(columnIndex, taskIndex)"
          @keypress.enter="() => handleTaskCardClick(columnIndex, taskIndex)"
          v-for="(task, taskIndex) in tasksStore.tasks[columnIndex]"
          :key="taskIndex"
          :howManyCompleted="
            returnNumberOfElements(columnIndex, taskIndex, 'subtasksCompleted')
          "
          :howManySubtasks="
            returnNumberOfElements(columnIndex, taskIndex, 'subtasks')
          "
          :title="task.title"
        />
      </div>
      <div
        @click="isEditBoardModalShown = true"
        class="new-column group"
        tabindex="0"
      >
        <span class="new-column-text">+ New Column</span>
      </div>
    </div>
    <Teleport to="body">
      <transition name="modal">
        <see-task-modal
          v-if="
            isSeeTaskModalShown &&
            clickedTask != null &&
            subtasksOfClickedTask != null &&
            columnOfClickedTask != null
          "
          @close-modal="isSeeTaskModalShown = false"
          @show-edit-form="showEditForm"
          @show-delete-form="showDeleteForm"
          :columnIndex="columnOfClickedTask"
          :task="clickedTask"
          :subtasks="subtasksOfClickedTask"
        />
      </transition>
    </Teleport>
    <transition name="modal">
      <confirmation-modal
        v-if="isDeleteTaskModalShown || isDeleteColumnModalShown"
        @close-modal="
          isDeleteTaskModalShown
            ? (isDeleteTaskModalShown = false)
            : (isDeleteColumnModalShown = false)
        "
        :elementToDelete="isDeleteTaskModalShown ? 'task' : 'column'"
        :elementName="
          isDeleteTaskModalShown
            ? (clickedTask as Task).title
            : (columnToDelete as BoardColumn).name
        "
        :elementID="
          isDeleteTaskModalShown
            ? (clickedTask as Task).taskID
            : (columnToDelete as BoardColumn).columnID
        "
      />
    </transition>
    <transition name="modal">
      <task-modal
        v-if="
          isEditTaskModalShown &&
          clickedTask != null &&
          subtasksOfClickedTask != null &&
          columnOfClickedTask != null
        "
        @close-modal="isEditTaskModalShown = false"
        action="edit"
        :columnIndex="columnOfClickedTask"
        :task="clickedTask"
        :subtasks="subtasksOfClickedTask"
      />
    </transition>
    <transition name="modal">
      <board-modal
        v-if="isEditBoardModalShown"
        @close-modal="isEditBoardModalShown = false"
        action="edit"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import TaskCard from './TaskCard.vue'
import SeeTaskModal from './Modals/SeeTaskModal.vue'
import ConfirmationModal from '../components/Modals/ConfirmationModal.vue'
import TaskModal from '../components/Modals/TaskModal.vue'
import BoardModal from '../components/Modals/BoardModal.vue'
import CloseIcon from './Svgs/CloseIcon.vue'
import { computed, ref } from 'vue'
import { useBoardsStore } from '../stores/boards'
import { useTasksStore } from '../stores/tasks'

defineProps<{
  logo: boolean
}>()

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()

const circleColor = computed(() => {
  if (boardsStore.boardColumns != null) {
    return (column: BoardColumn) => ({
      'bg-blue-600':
        (boardsStore.boardColumns as BoardColumn[]).indexOf(column) % 3 === 0,
      'bg-blue-500':
        (boardsStore.boardColumns as BoardColumn[]).indexOf(column) % 3 === 1,
      'bg-green-400':
        (boardsStore.boardColumns as BoardColumn[]).indexOf(column) % 3 === 2
    })
  }
  return null
})

const isSeeTaskModalShown = ref(false)
const isEditTaskModalShown = ref(false)
const isDeleteTaskModalShown = ref(false)
const isEditBoardModalShown = ref(false)

const showEditForm = () => {
  isSeeTaskModalShown.value = false
  isEditTaskModalShown.value = true
}
const showDeleteForm = () => {
  isSeeTaskModalShown.value = false
  isDeleteTaskModalShown.value = true
}

type Element = 'tasks' | 'subtasks' | 'subtasksCompleted'
const returnNumberOfElements = (
  columnIndex: number,
  taskIndex: number,
  element: Element
) => {
  if (
    tasksStore.subtasks[columnIndex] == null ||
    tasksStore.subtasks[columnIndex][taskIndex] == null
  )
    return 0

  const elementFns = {
    tasks: () => tasksStore.tasks[columnIndex].length,
    subtasks: () => tasksStore.subtasks[columnIndex][taskIndex].length,
    subtasksCompleted: () =>
      tasksStore.subtasks[columnIndex][taskIndex].filter(
        (subtask) => subtask.isCompleted
      ).length
  }

  return elementFns[element]()
}

const columnOfClickedTask = ref<null | number>(null)
const clickedTask = ref<null | Task>(null)
const subtasksOfClickedTask = ref<null | Subtask[]>(null)

const handleTaskCardClick = (columnIndex: number, taskIndex: number) => {
  saveClickedTask(columnIndex, taskIndex)

  isSeeTaskModalShown.value = true
}
const saveClickedTask = (columnIndex: number, taskIndex: number) => {
  columnOfClickedTask.value = columnIndex
  clickedTask.value = tasksStore.tasks[columnIndex][taskIndex]

  saveSubtasksOfClickedTask(columnIndex, taskIndex)
}
const saveSubtasksOfClickedTask = (columnIndex: number, taskIndex: number) => {
  subtasksOfClickedTask.value = tasksStore.subtasks[columnIndex][taskIndex]
}

const columnToDelete = ref<null | BoardColumn>(null)
const isDeleteColumnModalShown = ref(false)
const handleDeleteIconClick = (column: BoardColumn) => {
  isDeleteColumnModalShown.value = true
  columnToDelete.value = column
}
</script>

<style lang="postcss" scoped>
.columns-container {
  @apply px-room-for-outline h-full overflow-auto;
  @apply scrollbar-invisible hover:scrollbar-visibleLight dark:hover:scrollbar-visibleDark;
}

.columns-container--sizes {
  @apply w-[calc(100vw-32px)] sm:w-[calc(67vw-48px)];
  @apply lg:w-[calc(75vw-48px)] xl:w-[calc(80vw-48px)];
}

.new-column {
  @apply flex items-center justify-center mt-[44px] min-w-[280px] shadow-column;
  @apply bg-gradient-to-b from-blue-100 to-blue-80 cursor-pointer;
  @apply dark:from-gray-700 dark:to-gray-680;
}

.new-column-text {
  @apply flex p-2 text-gray-400 text-xl group-hover:text-purple-400;
  @apply group-focus:text-purple-400 transition-colors duration-300;
}
</style>

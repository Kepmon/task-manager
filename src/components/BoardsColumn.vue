<template>
  <div class="columns-container">
    <div
      class="flex gap-6"
      :class="{
        'place-content-center h-full': boardsStore.boardColumns.length === 0
      }"
    >
      <div
        v-for="(column, columnIndex) in boardsStore.boardColumns"
        :key="column.columnID"
        class="w-[280px] shrink-0"
      >
        <div
          class="relative flex items-center gap-2 py-[var(--room-for-outline)] mb-4 min-w-[280px]"
        >
          <div
            class="h-[15px] w-[15px] rounded-full"
            :class="circleColor ? circleColor(column) : ''"
          ></div>
          <p class="text-xs text-gray-400 uppercase">
            <span class="sr-only">
              {{ formatColumnNumber(columnIndex + 1) }} column - title:</span
            >{{ column.name }} ({{
              returnNumberOfElements(columnIndex, 0, 'tasks')
            }})
            <span class="sr-only">tasks inside</span>
          </p>
          <close-icon
            @handle-close="() => modals.handleDeleteIconClick(column)"
            :isColumn="true"
            :data-focus="columnIndex === 0 ? 'true' : undefined"
          />
        </div>
        <div class="grid gap-[20px]">
          <task-card
            @click="() => tasks.handleTaskCardClick(columnIndex, taskIndex)"
            v-for="({ title, taskID }, taskIndex) in tasksStore.tasks[
              columnIndex
            ]"
            :key="taskID"
            :taskID="taskID"
            :howManyCompleted="
              returnNumberOfElements(
                columnIndex,
                taskIndex,
                'subtasksCompleted'
              )
            "
            :howManySubtasks="
              returnNumberOfElements(columnIndex, taskIndex, 'subtasks')
            "
            :title="title"
          />
        </div>
      </div>
      <button
        v-if="boardsStore.boardColumns.length > 0"
        @click="modals.isEditBoardModalShown = true"
        aria-label="click here to add a new column"
        class="new-column group"
      >
        &#65291;New Column
      </button>
      <empty-info :emptyBoard="boardsStore.boardColumns.length === 0" />
    </div>
    <Teleport to="body">
      <transition name="modal">
        <see-task-modal
          v-if="modals.isSeeTaskModalShown && tasksConditions"
          @close-modal="modals.isSeeTaskModalShown = false"
          @show-edit-form="modals.showEditForm"
          @show-delete-form="modals.showDeleteForm"
          @handle-move-task="(value) => moveTask(value)"
          v-bind="tasksProps"
        />
      </transition>
    </Teleport>
    <transition name="modal">
      <confirmation-modal
        v-if="modals.isDeleteTaskModalShown || modals.isDeleteColumnModalShown"
        @close-modal="
          modals.isDeleteTaskModalShown
            ? (modals.isDeleteTaskModalShown = false)
            : (modals.isDeleteColumnModalShown = false)
        "
        :elementToDelete="modals.isDeleteTaskModalShown ? 'task' : 'column'"
        :elementName="
          modals.isDeleteTaskModalShown
            ? (tasksStore.clickedTask as Task).title
            : (modals.columnToDelete as BoardColumn).name
        "
        :elementID="
          modals.isDeleteTaskModalShown
            ? (tasksStore.clickedTask as Task).taskID
            : (modals.columnToDelete as BoardColumn).columnID
        "
        :columnOfClickedTask="
          tasksStore.columnOfClickedTask
            ? boardsStore.boardColumns[tasksStore.columnOfClickedTask].columnID
            : undefined
        "
      />
    </transition>
    <transition name="modal">
      <task-modal
        v-if="modals.isEditTaskModalShown && tasksConditions"
        @change-var-to-false="modals.isEditTaskModalShown = false"
        action="edit"
        v-bind="tasksProps"
      />
    </transition>
    <transition name="modal">
      <board-modal
        v-if="modals.isEditBoardModalShown"
        @change-var-to-false="modals.isEditBoardModalShown = false"
        action="edit"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import EmptyInfo from '../components/EmptyInfo.vue'
import TaskCard from './TaskCard.vue'
import SeeTaskModal from './Modals/SeeTaskModal.vue'
import ConfirmationModal from '../components/Modals/ConfirmationModal.vue'
import TaskModal from '../components/Modals/TaskModal.vue'
import BoardModal from '../components/Modals/BoardModal.vue'
import CloseIcon from './Svgs/CloseIcon.vue'
import { computed, ref } from 'vue'
import { useBoardsStore } from '../stores/boards'
import { useTasksStore } from '../stores/tasks'
import { useFormsStore } from '../stores/forms'
import converter from 'number-to-words'

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const formsStore = useFormsStore()

const formatColumnNumber = (number: number) => converter.toWordsOrdinal(number)

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

const modals = ref({
  isSeeTaskModalShown: false,
  isEditTaskModalShown: false,
  isDeleteTaskModalShown: false,
  isEditBoardModalShown: false,
  isDeleteColumnModalShown: false,
  columnToDelete: <null | BoardColumn>null,
  showEditForm: () => {
    modals.value.isSeeTaskModalShown = false
    modals.value.isEditTaskModalShown = true
  },
  showDeleteForm: () => {
    modals.value.isSeeTaskModalShown = false
    modals.value.isDeleteTaskModalShown = true
  },
  handleDeleteIconClick: (column: BoardColumn) => {
    modals.value.isDeleteColumnModalShown = true
    modals.value.columnToDelete = column
  }
})

const tasks = ref({
  handleTaskCardClick: (columnIndex: number, taskIndex: number) => {
    tasks.value.saveClickedTask(columnIndex, taskIndex)

    modals.value.isSeeTaskModalShown = true
  },
  saveClickedTask: (columnIndex: number, taskIndex: number) => {
    tasksStore.columnOfClickedTask = columnIndex
    tasksStore.clickedTask = tasksStore.tasks[columnIndex][taskIndex]

    tasks.value.saveSubtasksOfClickedTask(columnIndex, taskIndex)
  },
  saveSubtasksOfClickedTask: (columnIndex: number, taskIndex: number) => {
    tasksStore.subtasksOfClickedTask =
      tasksStore.subtasks[columnIndex][taskIndex]

    formsStore.updateFormData('task')
  }
})

interface TasksProps {
  columnIndex: number
  task: Task
  subtasks: Subtask[]
}
const tasksProps = computed(() => ({
  columnIndex: tasksStore.columnOfClickedTask,
  task: tasksStore.clickedTask,
  subtasks: tasksStore.subtasksOfClickedTask
})) as Ref<TasksProps>
const tasksConditions = computed(() =>
  [
    tasksStore.clickedTask != null,
    tasksStore.subtasksOfClickedTask.length !== 0,
    tasksStore.columnOfClickedTask != null
  ].every((taskCondition) => taskCondition)
)

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

const moveTask = async (value: BoardColumn['name']) => {
  const nextColumnID = (
    boardsStore.boardColumns.find(
      (boardColumn) => boardColumn.name === value
    ) as BoardColumn
  ).columnID

  await tasksStore.moveTaskBetweenColumns(nextColumnID)
  await boardsStore.getColumns()

  modals.value.isSeeTaskModalShown = false
}
</script>

<style lang="postcss" scoped>
.columns-container {
  @apply px-[var(--room-for-outline)] h-full;
}

.new-column {
  @apply grid place-content-center shrink-0 mt-[52px] shadow-column;
  @apply h-[calc(100vh-180px)] w-[280px];
  @apply bg-gradient-to-b from-blue-100 to-blue-80 cursor-pointer;
  @apply dark:from-gray-700 dark:to-gray-680 rounded-md;
  @apply text-gray-400 text-xl hover:text-purple-600;
  @apply focus-visible:text-purple-600 transition-colors duration-300;
}
</style>

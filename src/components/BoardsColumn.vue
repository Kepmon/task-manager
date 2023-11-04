<template>
  <div class="columns-wrapper">
    <div
      class="flex gap-6 py-4 sm:py-6 col-start-2 col-span-1"
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
            :style="`background-color: ${returnCircleColor(column)};`"
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
        <draggable
          @end="dragTasks"
          v-model="tasksStore.tasks[columnIndex]"
          :move="findElementsIDs"
          itemKey="taskID"
          tag="ul"
          group="tasksCards"
          :animation="200"
          class="grid gap-[20px]"
          :data-columnID="boardsStore.boardColumns[columnIndex].columnID"
        >
          <template #item="{ element: columnTask }">
            <li>
              <task-card
                @click="
                  () =>
                    tasks.handleTaskCardClick(
                      columnIndex,
                      tasksStore.tasks[columnIndex].indexOf(columnTask)
                    )
                "
                :key="columnTask.taskID"
                :taskID="columnTask.taskID"
                :howManyCompleted="
                  returnNumberOfElements(
                    columnIndex,
                    tasksStore.tasks[columnIndex].indexOf(columnTask),
                    'subtasksCompleted'
                  )
                "
                :howManySubtasks="
                  returnNumberOfElements(
                    columnIndex,
                    tasksStore.tasks[columnIndex].indexOf(columnTask),
                    'subtasks'
                  )
                "
                :title="columnTask.title"
              />
            </li>
          </template>
        </draggable>
      </div>
      <button
        v-if="boardsStore.boardColumns.length > 0"
        @click="modals.isNewColumnModalShown = true"
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
    <transition name="modal">
      <new-column-modal
        v-if="modals.isNewColumnModalShown"
        @close-modal="modals.isNewColumnModalShown = false"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import type { BoardColumn, Task, Subtask } from '../api/boardsTypes'
import type { MoveDragEvent, DragEndEvent } from '../api/dragTypes'
import EmptyInfo from '../components/EmptyInfo.vue'
import TaskCard from './TaskCard.vue'
import SeeTaskModal from './Modals/SeeTaskModal.vue'
import ConfirmationModal from '../components/Modals/ConfirmationModal.vue'
import TaskModal from '../components/Modals/TaskModal.vue'
import BoardModal from '../components/Modals/BoardModal.vue'
import NewColumnModal from './Modals/NewColumnModal.vue'
import CloseIcon from './Svgs/CloseIcon.vue'
import { handleResponse } from '../composables/responseHandler'
import { returnCircleColor } from '../composables/circleColor'
import { computed, ref } from 'vue'
import { useBoardsStore } from '../stores/boards'
import { useTasksStore } from '../stores/tasks'
import converter from 'number-to-words'
import draggable from 'vuedraggable'

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()

const formatColumnNumber = (number: number) => converter.toWordsOrdinal(number)

const modals = ref({
  isSeeTaskModalShown: false,
  isEditTaskModalShown: false,
  isDeleteTaskModalShown: false,
  isEditBoardModalShown: false,
  isDeleteColumnModalShown: false,
  isNewColumnModalShown: false,
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

  const response = await tasksStore.moveTaskBetweenColumns(nextColumnID)
  handleResponse(response)

  modals.value.isSeeTaskModalShown = false
}

const oldTaskIndex = ref<null | number>(null)
const newTaskIndex = ref<null | number>(null)
const prevColumnID = ref('')
const nextColumnID = ref('')
const taskToBeDragged = ref<null | Task>(null)
const indexOfOldColumn = ref<null | number>(null)
const indexOfNewColumn = ref<null | number>(null)

const setIndexesOfTasksInNewColumn = () => {
  const oldColumn = boardsStore.boardColumns.find(
    (column) => column.columnID === prevColumnID.value
  )
  const newColumn = boardsStore.boardColumns.find(
    (column) => column.columnID === nextColumnID.value
  )

  indexOfOldColumn.value =
    oldColumn != null ? boardsStore.boardColumns.indexOf(oldColumn) : null
  indexOfNewColumn.value =
    newColumn != null ? boardsStore.boardColumns.indexOf(newColumn) : null

  const newColumnTasks =
    indexOfNewColumn.value != null
      ? [...tasksStore.tasks[indexOfNewColumn.value]]
      : []

  if (newColumnTasks.length === 0) return []

  return newColumnTasks.map(({ taskID }, taskIndex) => ({
    taskID,
    taskIndex
  }))
}

const findElementsIDs = (e: MoveDragEvent) => {
  prevColumnID.value = e.from.getAttribute('data-columnID') || ''
  nextColumnID.value = e.to.getAttribute('data-columnID') || ''
  taskToBeDragged.value = e.draggedContext.element
}

const dragTasks = async (e: DragEndEvent) => {
  const isTaskMovedWithinTheSameColumn = e.from === e.to
  const taskIndexes = setIndexesOfTasksInNewColumn()

  oldTaskIndex.value = e.oldIndex
  newTaskIndex.value = e.newIndex

  prevColumnID.value = e.from.getAttribute('data-columnID') || ''
  nextColumnID.value = e.to.getAttribute('data-columnID') || ''

  if (
    !isTaskMovedWithinTheSameColumn &&
    indexOfOldColumn.value != null &&
    indexOfNewColumn.value != null &&
    oldTaskIndex.value != null &&
    newTaskIndex.value != null
  ) {
    tasksStore.setNewIndexesForDifferentColumns(
      indexOfOldColumn.value,
      indexOfNewColumn.value,
      oldTaskIndex.value,
      newTaskIndex.value
    )
  }

  if (
    isTaskMovedWithinTheSameColumn &&
    indexOfNewColumn.value != null &&
    oldTaskIndex.value != null &&
    newTaskIndex.value != null
  ) {
    tasksStore.setNewIndexesForTheSameColumn(
      indexOfNewColumn.value,
      oldTaskIndex.value,
      newTaskIndex.value
    )
  }

  if (
    prevColumnID.value !== '' &&
    nextColumnID.value !== '' &&
    taskToBeDragged.value != null
  ) {
    await tasksStore.moveTaskBetweenColumns(
      nextColumnID.value,
      prevColumnID.value,
      taskToBeDragged.value,
      taskIndexes
    )
  }
}
</script>

<style lang="postcss" scoped>
.columns-wrapper {
  @apply grid grid-cols-[16px_auto_16px] sm:grid-cols-[24px_auto_24px];
  @apply h-full overflow-x-auto scrollbar-invisible;
  @apply hover:scrollbar-visibleLight dark:hover:scrollbar-visibleDark;
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

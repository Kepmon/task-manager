<template>
  <div class="columns-wrapper">
    <div
      class="flex gap-6 py-4 sm:py-6 col-start-2 col-span-1"
      :class="{
        'place-content-center h-full': boardColumns.length === 0
      }"
    >
      <div
        v-for="(column, columnIndex) in boardColumns"
        :key="column.columnID"
        class="w-[280px] shrink-0"
      >
        <div
          class="relative flex items-center gap-2 py-[var(--room-for-outline)] mb-4 min-w-[280px]"
        >
          <div
            class="h-[15px] w-[15px] rounded-full"
            :style="`background-color: ${returnCircleColor(
              columnIndex,
              column.dotColor,
              false
            )};`"
          ></div>
          <p class="text-xs text-gray-400 uppercase">
            <span class="sr-only">
              {{ formatColumnNumber(columnIndex + 1) }} column - title:</span
            >{{ column.name }} ({{ boardTasks[columnIndex]?.length || 0 }})
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
          v-model="boardTasks[columnIndex]"
          :move="findElementsIDs"
          itemKey="taskID"
          tag="ul"
          group="tasksCards"
          :animation="200"
          class="grid gap-[20px]"
          :data-columnID="boardColumns[columnIndex].columnID"
          :data-columnIndex="columnIndex"
        >
          <template #item="{ element: columnTask }">
            <li>
              <task-card
                @click="
                  () =>
                    tasks.handleTaskCardClick(
                      columnIndex,
                      boardTasks[columnIndex].indexOf(columnTask)
                    )
                "
                :key="columnTask.taskID"
                :taskID="columnTask.taskID"
                :howManyCompleted="
                  returnSubtasksOfGivenTask(columnTask.taskID)?.filter(
                    ({ isCompleted }) => isCompleted
                  ).length || 0
                "
                :howManySubtasks="
                  returnSubtasksOfGivenTask(columnTask.taskID)?.length || 0
                "
                :title="columnTask.title"
              />
            </li>
          </template>
        </draggable>
      </div>
      <button
        v-if="boardColumns.length > 0"
        @click="modals.isNewColumnModalShown = true"
        aria-label="click here to add a new column"
        class="new-column group"
      >
        &#65291;New Column
      </button>
    </div>
    <Teleport to="body">
      <transition name="modal">
        <see-task-modal
          v-if="
            modals.isSeeTaskModalShown &&
            clickedTask != null &&
            columnOfClickedTask != null
          "
          @close-modal="modals.isSeeTaskModalShown = false"
          @show-edit-form="modals.showEditForm"
          @show-delete-form="modals.showDeleteForm"
          @handle-move-task="() => moveTaskUsingSeeTaskForm()"
          :task="clickedTask"
          :columnIndex="columnOfClickedTask"
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
              ? clickedTask?.title
              : (modals.columnToDelete as BoardColumn).name
          "
        :elementID="
            modals.isDeleteTaskModalShown
              ? clickedTask?.taskID
              : (modals.columnToDelete as BoardColumn).columnID
          "
        :columnOfClickedTask="
          columnOfClickedTask != null
            ? boardColumns[columnOfClickedTask].columnID
            : undefined
        "
      />
    </transition>
    <transition name="modal">
      <task-modal
        v-if="modals.isEditTaskModalShown"
        @change-var-to-false="modals.isEditTaskModalShown = false"
        action="edit"
        :columnIndex="
          columnOfClickedTask != null ? columnOfClickedTask : undefined
        "
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
import type { BoardColumn, Task } from '../api/boardsTypes'
import type { MoveDragEvent, DragEndEvent } from '../api/dragTypes'
import TaskCard from './TaskCard.vue'
import SeeTaskModal from './Modals/SeeTaskModal.vue'
import ConfirmationModal from '../components/Modals/ConfirmationModal.vue'
import TaskModal from '../components/Modals/TaskModal.vue'
import NewColumnModal from './Modals/NewColumnModal.vue'
import CloseIcon from './Svgs/CloseIcon.vue'
import { handleResponse } from '../composables/responseHandler'
import { returnCircleColor } from '../composables/circleColor'
import { returnSubtasksOfGivenTask } from '../composables/subtasksOfGivenTask'
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useTasksStore } from '../stores/tasks'
import { useFormsStore } from '../stores/forms'
import converter from 'number-to-words'
import draggable from 'vuedraggable'

const userStore = useUserStore()
const tasksStore = useTasksStore()
const formsStore = useFormsStore()

const boardColumns = computed(
  () => userStore.userData.currentBoard.boardColumns
)
const boardTasks = computed(() => userStore.userData.currentBoard.boardTasks)
const boardSubtasks = computed(
  () => userStore.userData.currentBoard.boardSubtasks
)
const clickedTask = computed(() => userStore.userData.currentBoard.clickedTask)
const columnOfClickedTask = computed(
  () => userStore.userData.currentBoard.columnOfClickedTask
)

const formatColumnNumber = (number: number) => converter.toWordsOrdinal(number)

const modals = ref({
  isSeeTaskModalShown: false,
  isEditTaskModalShown: false,
  isDeleteTaskModalShown: false,
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
    const idOfCurrentClickedTask = clickedTask.value?.taskID
    const idOfNewClickedTask = boardTasks.value[columnIndex][taskIndex].taskID

    if (idOfCurrentClickedTask === idOfNewClickedTask) return

    userStore.userData.currentBoard.columnOfClickedTask = columnIndex
    userStore.userData.currentBoard.clickedTask =
      boardTasks.value[columnIndex][taskIndex]

    tasks.value.saveSubtasksOfClickedTask(idOfNewClickedTask)
    formsStore.resetFormData('task', 'edit')
  },
  saveSubtasksOfClickedTask: (taskID: string) => {
    userStore.userData.currentBoard.subtasksOfClickedTask =
      boardSubtasks.value.find((subtasksArr) =>
        subtasksArr.every(({ taskID: id }) => id === taskID)
      ) || []
  }
})

const oldTaskIndex = ref<null | number>(null)
const newTaskIndex = ref<null | number>(null)
const oldColumnID = ref('')
const newColumnID = ref('')
const taskToBeDragged = ref<null | Task>(null)
const indexOfOldColumn = ref<null | number>(null)
const indexOfNewColumn = ref<null | number>(null)

const findElementsIDs = (e: MoveDragEvent) => {
  oldColumnID.value = e.from.getAttribute('data-columnID') || ''
  newColumnID.value = e.to.getAttribute('data-columnID') || ''
  indexOfOldColumn.value = parseInt(
    e.from.getAttribute('data-columnIndex') || '0'
  )
  indexOfNewColumn.value = parseInt(e.to.getAttribute('data-columnIndex') || '')

  taskToBeDragged.value = e.draggedContext.element
}

const dragTasks = async (e: DragEndEvent) => {
  const isTaskMovedWithinTheSameColumn = e.from === e.to

  oldTaskIndex.value = e.oldIndex
  newTaskIndex.value = e.newIndex

  if (isTaskMovedWithinTheSameColumn && e.oldIndex !== e.newIndex) {
    const columnIndex = parseInt(
      e.target.getAttribute('data-columnIndex') || '0'
    )
    const columnID = e.target.getAttribute('data-columnID') || ''

    const response = await tasksStore.moveTaskWithinTheSameColumn(
      columnID,
      columnIndex,
      oldTaskIndex.value,
      newTaskIndex.value
    )
    handleResponse(response)
  }

  if (
    !isTaskMovedWithinTheSameColumn &&
    taskToBeDragged.value != null &&
    indexOfOldColumn.value != null &&
    indexOfNewColumn.value != null
  ) {
    userStore.userData.currentBoard.columnOfClickedTask = indexOfOldColumn.value

    const response = await tasksStore.moveTaskBetweenColumns(
      indexOfOldColumn.value,
      indexOfNewColumn.value,
      taskToBeDragged.value,
      newTaskIndex.value,
      oldTaskIndex.value
    )
    handleResponse(response)
  }
}

const moveTaskUsingSeeTaskForm = async () => {
  modals.value.isSeeTaskModalShown = false
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

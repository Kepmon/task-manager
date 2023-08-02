<template>
  <div
    v-if="columns?.length !== 0"
    class="columns-container"
    :class="{ 'columns-container--sizes': !logo }"
  >
    <div class="flex gap-6 h-full">
      <div
        v-for="(column, index) in columns"
        :key="index"
        class="flex flex-col"
      >
        <div class="flex items-center gap-2 mb-8 min-w-[280px]">
          <div
            class="h-[15px] w-[15px] rounded-full"
            :class="circleColor ? circleColor(column) : ''"
          ></div>
          <p class="text-xs text-gray-400 uppercase">
            {{ column.name }} ({{ column.tasks?.length || 0 }})
          </p>
        </div>
        <task-card
          @change="(title) => (clickedTitle = title)"
          v-for="{ title } in column.tasks"
          :key="title"
          :howManyCompleted="0"
          :howManySubtasks="0"
          :title="title"
          :isClickedTask="clickedTitle === title"
        />
      </div>
      <div class="new-column group" tabindex="0">
        <span class="new-column-text">+ New Column</span>
      </div>
    </div>
    <Teleport to="body">
      <transition name="modal">
        <see-task-modal
          v-if="clickedTitle != null"
          @close-modal="closeSeeTask"
          @show-edit-form="showEditForm"
          @show-delete-form="showDeleteForm"
        />
      </transition>
    </Teleport>
    <transition name="modal">
      <confirmation-modal
        v-if="isDeleteTaskModalShown"
        @close-modal="isDeleteTaskModalShown = false"
        elementToDelete="task"
        elementName="Research pricing points of various competitors and trial different business models"
      />
    </transition>
    <transition name="modal">
      <task-modal
        v-if="isEditTaskModalShown"
        @close-modal="isEditTaskModalShown = false"
        action="edit"
        :selectedMultiOptionItems="selectedMultiOptionItems"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { BoardColumn, Task } from '../api/boardsTypes'
import TaskCard from './TaskCard.vue'
import SeeTaskModal from './Modals/SeeTaskModal.vue'
import ConfirmationModal from '../components/Modals/ConfirmationModal.vue'
import TaskModal from '../components/Modals/TaskModal.vue'
import { computed, ref } from 'vue'

const props = defineProps<{
  columns: BoardColumn[] | null
  logo: boolean
  selectedMultiOptionItems: string[]
}>()

const circleColor = computed(() => {
  if (props.columns != null) {
    return (column: BoardColumn) => ({
      'bg-blue-600': (props.columns as BoardColumn[]).indexOf(column) % 3 === 0,
      'bg-blue-500': (props.columns as BoardColumn[]).indexOf(column) % 3 === 1,
      'bg-green-400': (props.columns as BoardColumn[]).indexOf(column) % 3 === 2
    })
  }
  return null
})

const clickedTitle = ref<null | Task['title']>(null)

const isEditTaskModalShown = ref(false)
const isDeleteTaskModalShown = ref(false)

const closeSeeTask = () => {
  clickedTitle.value = null
}

const showEditForm = () => {
  isEditTaskModalShown.value = true
  closeSeeTask()
}

const showDeleteForm = () => {
  isDeleteTaskModalShown.value = true
  closeSeeTask()
}
</script>

<style lang="postcss" scoped>
.columns-container {
  @apply h-full overflow-auto;
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

<template>
  <div class="header-content">
    <svg
      width="40"
      height="25"
      class="sm:hidden mr-1"
      aria-label="The app logo"
    >
      <g fill="#635FC7" fill-rule="evenodd">
        <rect width="6" height="25" rx="2" />
        <rect opacity=".75" x="9" width="6" height="25" rx="2" />
        <rect opacity=".5" x="18" width="6" height="25" rx="2" />
      </g>
    </svg>
    <div
      @click="$emit('toggle-boards-nav')"
      data-toggle="boards-nav"
      class="mr-6"
    >
      <h1 class="inline font-bold text-lgFluid">
        {{ boardsStore.currentBoard?.name }}
      </h1>
      <svg
        width="10"
        height="7"
        class="inline sm:hidden ml-2 transition-transform duration-500"
        :class="{ 'rotate-180': navOpen }"
      >
        <path
          stroke-width="2"
          fill="none"
          d="m1 1 4 4 4-4"
          class="stroke-purple-400"
        />
      </svg>
    </div>
    <div class="flex items-center gap-2 sm:gap-3 ml-auto text-white">
      <button
        @click="isAddTaskModalShown = true"
        aria-labelledby="add-new-task"
        :aria-hidden="isBoardEmpty ? `true` : undefined"
        class="regular-button purple-class add-new-task-btn"
        :class="{
          'opacity-25 cursor-not-allowed': isBoardEmpty,
          'cursor-pointer': !isBoardEmpty
        }"
      >
        <span aria-hidden="true" class="text-lg md:text-baseFluid"
          >&#65291;</span
        >
        <span id="add-new-task" aria-hidden="true" class="hidden md:block"
          >Add New Task</span
        >
      </button>
      <div class="relative">
        <more-options-icon
          @toggle-options="areBoardOptionsShown = !areBoardOptionsShown"
          element="board"
        />
        <more-options
          @toggle-options="(e: Event) => handleMoreOptionsFn(e, toggleOptions)"
          @show-edit-form="isEditBoardModalShown = true"
          @show-delete-form="isDeleteBoardModalShown = true"
          @close-more-options="(e: Event) => handleMoreOptionsFn(e, closeOptions)"
          :condition="areBoardOptionsShown"
          element="board"
        />
      </div>
    </div>
    <user-options :isDashboardEmpty="boardsStore.currentBoard == null" />
    <transition name="modal">
      <task-modal
        v-if="isAddTaskModalShown"
        @change-var-to-false="isAddTaskModalShown = false"
        action="add"
      />
    </transition>
    <transition name="modal">
      <confirmation-modal
        v-if="isDeleteBoardModalShown"
        @close-modal="isDeleteBoardModalShown = false"
        elementToDelete="board"
        :elementName="(boardsStore.currentBoard as Board).name"
        :elementID="(boardsStore.currentBoardID as Board['boardID'])"
      />
    </transition>
    <transition name="modal">
      <board-modal
        v-if="isEditBoardModalShown"
        @change-var-to-false="isEditBoardModalShown = false"
        action="edit"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Board } from '../api/boardsTypes'
import MoreOptions from './shared/MoreOptions.vue'
import MoreOptionsIcon from './Svgs/MoreOptionsIcon.vue'
import TaskModal from './Modals/TaskModal.vue'
import ConfirmationModal from './Modals/ConfirmationModal.vue'
import BoardModal from './Modals/BoardModal.vue'
import UserOptions from './UserOptions.vue'
import moreOptionsPopup from '../composables/moreOptionsPopup'
import { useBoardsStore } from '../stores/boards'
import type { Ref } from 'vue'
import { ref } from 'vue'

defineProps<{
  isBoardEmpty: boolean
  navOpen: boolean
}>()
defineEmits(['toggle-boards-nav'])

const areBoardOptionsShown = ref(false)

const isAddTaskModalShown = ref(false)
const isDeleteBoardModalShown = ref(false)
const isEditBoardModalShown = ref(false)

const boardsStore = useBoardsStore()

const { toggleOptions, closeOptions } = moreOptionsPopup
const handleMoreOptionsFn = (
  e: Event,
  cb: (e: Event, conditionToChange: Ref<boolean>) => void
) => {
  cb(e, areBoardOptionsShown)
}
</script>

<style lang="postcss" scoped>
.header-content {
  @apply col-span-2 sm:col-start-2 flex items-center;
  @apply py-5 sm:py-0 px-[var(--padding-sm)] sm:px-[var(--padding-lg)];
  @apply border-b border-gray-350 dark:border-gray-600;
}

.add-new-task-btn {
  @apply px-4 py-1 gap-[2px] md:py-[10px] w-max text-baseFluid;
}
</style>

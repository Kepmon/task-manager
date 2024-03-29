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
      v-on="isMobileMode ? { click: () => $emit('toggle-boards-nav') } : {}"
      data-toggle="boards-nav"
      class="mr-6"
    >
      <h1 class="inline font-bold text-lgFluid">
        <span class="sr-only">Currently active board: </span>
        {{ currentBoard.boardName }}
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
        :disabled="isBoardEmpty ? true : undefined"
        aria-labelledby="add-new-task"
        :aria-hidden="isBoardEmpty ? `true` : undefined"
        class="regular-button purple-class add-new-task-btn"
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
          :expandedCondition="areBoardOptionsShown"
        />
        <transition name="options">
          <more-options
            v-if="areBoardOptionsShown"
            @toggle-options="(e: Event) => handleMoreOptionsFn(e, toggleOptions)"
            @handle-first-option-click="isEditBoardModalShown = true"
            @handle-second-option-click="isDeleteBoardModalShown = true"
            @close-more-options="(e: Event) => handleMoreOptionsFn(e, closeOptions)"
            element="board"
          />
        </transition>
      </div>
    </div>
    <user-options :isDashboardEmpty="currentBoard == null" />
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
        :elementName="currentBoard.boardName"
        :elementID="currentBoard.boardID"
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
import MoreOptions from './shared/MoreOptions.vue'
import MoreOptionsIcon from './Svgs/MoreOptionsIcon.vue'
import TaskModal from './Modals/TaskModal.vue'
import ConfirmationModal from './Modals/ConfirmationModal.vue'
import BoardModal from './Modals/BoardModal.vue'
import UserOptions from './UserOptions.vue'
import toggleMoreOptions from '../composables/toggleMoreOptions'
import { useUserStore } from '../stores/user'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'

const props = defineProps<{
  isBoardEmpty: boolean
  navOpen: boolean
  width: number
}>()
defineEmits(['toggle-boards-nav'])

const userStore = useUserStore()
const currentBoard = computed(() => userStore.userData.currentBoard)

const isMobileMode = props.width < 640
const areBoardOptionsShown = ref(false)

const isAddTaskModalShown = ref(false)
const isDeleteBoardModalShown = ref(false)
const isEditBoardModalShown = ref(false)

const { toggleOptions, closeOptions } = toggleMoreOptions
const handleMoreOptionsFn = (
  e: Event,
  cb: (
    e: Event,
    conditionToChange: Ref<boolean>,
    protectedElement: string
  ) => void
) => {
  cb(e, areBoardOptionsShown, 'ellipsis')
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

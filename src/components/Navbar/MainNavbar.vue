<template>
  <div class="grid" :class="{ 'col-span-2': isLogo }">
    <nav aria-label="main navigation" class="main-nav">
      <div class="flex items-center gap-2">
        <svg width="24" height="25" class="sm:hidden" aria-label="The app logo">
          <g fill="#635FC7" fill-rule="evenodd">
            <rect width="6" height="25" rx="2" />
            <rect opacity=".75" x="9" width="6" height="25" rx="2" />
            <rect opacity=".5" x="18" width="6" height="25" rx="2" />
          </g>
        </svg>
        <div v-if="isLogo" class="main-nav__logo hidden sm:flex">
          <logo-icon aria-label="The app logo" class="mr-8" />
        </div>
        <div
          @click="$emit('toggle-boards-nav')"
          class="flex items-center gap-2"
        >
          <h1 class="py-4 font-bold xs:text-lg" :class="{ 'sm:pl-6': isLogo }">
            {{ boardsStore.currentBoard?.name }}
          </h1>
          <svg
            width="10"
            height="7"
            class="transition-transform duration-500 block sm:hidden"
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
      </div>
      <div class="flex items-center gap-2 ml-auto sm:gap-3 text-white">
        <button
          @click="isAddTaskModalShown = true"
          class="gap-[2px] purple-class px-4 py-[2px] rounded-2xl md:p-0 regular-button"
          :class="{
            'opacity-25 cursor-not-allowed': isBoardEmpty,
            'cursor-pointer': !isBoardEmpty
          }"
        >
          <span class="leading-none text-2xl md:text-base">+</span>
          <span class="hidden md:block">Add New Task</span>
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
      <user-options
        class="fixed grid items-center ml-3 sm:static scale-125 sm:scale-100"
        :class="{
          'sm:fixed sm:scale-125': boardsStore.currentBoard == null
        }"
      />
    </nav>
    <transition name="modal">
      <task-modal
        v-if="isAddTaskModalShown"
        @close-modal="isAddTaskModalShown = false"
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
        @close-modal="isEditBoardModalShown = false"
        action="edit"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Board } from '../../api/boardsTypes'
import MoreOptions from '../shared/MoreOptions.vue'
import MoreOptionsIcon from '../Svgs/MoreOptionsIcon.vue'
import TaskModal from '../Modals/TaskModal.vue'
import ConfirmationModal from '../Modals/ConfirmationModal.vue'
import BoardModal from '../Modals/BoardModal.vue'
import LogoIcon from '../Svgs/LogoIcon.vue'
import UserOptions from '../UserOptions.vue'
import moreOptionsPopup from '../../composables/moreOptionsPopup'
import { useBoardsStore } from '../../stores/boards'
import type { Ref } from 'vue'
import { ref } from 'vue'

defineProps<{
  sidebar: boolean
  isLogo: boolean
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
@screen md {
  .regular-button {
    @apply flex items-center grow justify-center gap-2 py-[10px] px-4 rounded-3xl;
  }
}
.main-nav {
  @apply flex items-center relative px-3;
  @apply xs:px-6 shadow-xs bg-white dark:bg-gray-700;
}

.main-nav__logo {
  @apply flex items-center h-full sm:border-r;
  @apply sm:border-blue-300 dark:border-gray-600;
}
</style>

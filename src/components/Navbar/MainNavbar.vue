<template>
  <div class="grid" :class="{ 'col-span-2': isLogo }">
    <more-options
      @toggle-options="(e: Event) => handleMoreOptionsFn(e, toggleOptions)"
      @show-edit-form="isEditBoardModalShown = true"
      @show-delete-form="isDeleteBoardModalShown = true"
      @close-more-options="(e: Event) => handleMoreOptionsFn(e, closeOptions)"
      :condition="areBoardOptionsShown"
      element="board"
    />
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
        <button
          @click.prevent="areBoardOptionsShown = !areBoardOptionsShown"
          data-ellipsis
          aria-label="click here to see more options"
          class="px-3 py-2 rounded-md focus-visible:outline outline-[3px] outline-gray-400"
        >
          <svg width="5" height="20" data-ellipsis>
            <g fill-rule="evenodd" class="fill-gray-400">
              <circle cx="2.308" cy="2.308" r="2.308" />
              <circle cx="2.308" cy="10" r="2.308" />
              <circle cx="2.308" cy="17.692" r="2.308" />
            </g>
          </svg>
        </button>
      </div>
      <user-options
        class="fixed ml-3 sm:static bottom-8 right-8 scale-125 sm:scale-100"
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
        :selectedMultiOptionItems="[
          'e.g. Make coffee',
          'e.g. Drink coffee & smile'
        ]"
      />
    </transition>
    <transition name="modal">
      <confirmation-modal
        v-if="isDeleteBoardModalShown"
        @close-modal="isDeleteBoardModalShown = false"
        elementToDelete="board"
        elementName="Platform Launch"
      />
    </transition>
    <transition name="modal">
      <board-modal
        v-if="isEditBoardModalShown"
        @close-modal="isEditBoardModalShown = false"
        action="edit"
        :selectedMultiOptionItems="selectedMultiOptionItems"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import MoreOptions from '../shared/MoreOptions.vue'
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
const subtasks = ref([
  {
    title: 'Settings - Account page',
    isCompleted: true
  },
  {
    title: 'Settings - Billing page',
    isCompleted: true
  },
  {
    title: 'Search page',
    isCompleted: false
  }
])
const selectedMultiOptionItems = subtasks.value.map((subtask) => subtask.title)

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

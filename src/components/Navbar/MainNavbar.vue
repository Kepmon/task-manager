<template>
  <div class="grid" :class="{ 'col-span-2': isLogo }">
    <more-options
      @toggle-options="(e: Event) => handleMoreOptionsFn(e, toggleOptions)"
      @show-edit-form="isEditBoardDialogShown = true"
      @show-delete-form="isDeleteBoardDialogShown = true"
      @close-more-options="(e: Event) => handleMoreOptionsFn(e, closeOptions)"
      :condition="areBoardOptionsShown"
      element="board"
    />
    <nav aria-label="main navigation" class="main-nav">
      <div class="flex items-center gap-2 h-full">
        <svg width="24" height="25" class="sm:hidden" aria-label="The app logo">
          <g fill="#635FC7" fill-rule="evenodd">
            <rect width="6" height="25" rx="2" />
            <rect opacity=".75" x="9" width="6" height="25" rx="2" />
            <rect opacity=".5" x="18" width="6" height="25" rx="2" />
          </g>
        </svg>
        <div v-if="isLogo && width >= 640" class="main-nav__logo">
          <logo-icon aria-label="The app logo" class="mr-8" />
        </div>
        <div
          @click="$emit('toggle-boards-nav')"
          class="flex items-center gap-2"
        >
          <h1
            class="py-4 font-bold xs:text-lg"
            :class="{ 'pl-6': isLogo && width >= 640 }"
          >
            {{ boardName }}
          </h1>
          <svg
            v-if="width < 640"
            width="10"
            height="7"
            class="transition-transform duration-500"
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
        <the-button
          @click="isAddTaskDialogShown = true"
          :regularButton="width >= 768 ? true : false"
          class="gap-[2px] purple-class"
          :class="{
            'opacity-25 cursor-not-allowed': isBoardEmpty,
            'cursor-pointer': !isBoardEmpty,
            'px-4 py-[2px] rounded-2xl': width < 768
          }"
        >
          <span class="leading-none" :class="{ 'text-2xl': width < 768 }"
            >+</span
          >
          <span v-if="width >= 768">Add New Task</span>
        </the-button>
        <the-button
          @click.prevent="areBoardOptionsShown = !areBoardOptionsShown"
          :regularButton="false"
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
        </the-button>
      </div>
      <Teleport v-if="width < 512" to="body">
        <user-options class="absolute bottom-8 right-8 scale-125" />
      </Teleport>
      <user-options v-else class="static ml-2 sm:ml-3" />
    </nav>
    <transition name="dialog">
      <task-dialog
        v-if="isAddTaskDialogShown"
        @close-dialog="isAddTaskDialogShown = false"
        action="add"
        :selectedMultiOptionItems="[
          'e.g. Make coffee',
          'e.g. Drink coffee & smile'
        ]"
      />
    </transition>
    <transition name="dialog">
      <confirmation-dialog
        v-if="isDeleteBoardDialogShown"
        @close-dialog="isDeleteBoardDialogShown = false"
        elementToDelete="board"
        elementName="Platform Launch"
      />
    </transition>
    <transition name="dialog">
      <board-dialog
        v-if="isEditBoardDialogShown"
        @close-dialog="isEditBoardDialogShown = false"
        action="edit"
        :selectedMultiOptionItems="selectedMultiOptionItems"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import TheButton from '../shared/TheButton.vue'
import MoreOptions from '../shared/MoreOptions.vue'
import TaskDialog from '../Dialogs/TaskDialog.vue'
import ConfirmationDialog from '../Dialogs/ConfirmationDialog.vue'
import BoardDialog from '../Dialogs/BoardDialog.vue'
import LogoIcon from '../Svgs/LogoIcon.vue'
import UserOptions from '../UserOptions.vue'
import moreOptionsPopup from '../../composables/moreOptionsPopup'
import { useBoardsStore } from '../../stores/boards'
import { ref, Ref } from 'vue'

defineProps<{
  sidebar: boolean
  isLogo: boolean
  theme: boolean
  isBoardEmpty: boolean
  width: number
  boardName: string
  navOpen: boolean
}>()
defineEmits(['toggle-boards-nav'])

const areBoardOptionsShown = ref(false)
const isAddTaskDialogShown = ref(false)
const isDeleteBoardDialogShown = ref(false)
const isEditBoardDialogShown = ref(false)

const { columns } = useBoardsStore()
const selectedMultiOptionItems = columns.map((column) => column.name)

const { toggleOptions, closeOptions } = moreOptionsPopup
const handleMoreOptionsFn = (
  e: Event,
  cb: (e: Event, conditionToChange: Ref<boolean>) => void
) => {
  cb(e, areBoardOptionsShown)
}
</script>

<style scoped>
.main-nav {
  @apply flex items-center relative px-3;
  @apply xs:px-6 shadow-xs bg-white dark:bg-gray-700;
}

.main-nav__logo {
  @apply flex items-center h-full sm:border-r;
  @apply sm:border-blue-300 dark:border-gray-600;
}
</style>

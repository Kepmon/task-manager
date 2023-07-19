<template>
  <transition name="nav">
    <nav
      v-if="condition && !boardsNewStore.isLoading"
      aria-label="boards navigation"
      class="boards"
    >
      <div class="hidden sm:block px-[10%] mt-4 mb-[54px]">
        <logo-icon aria-label="The app logo" />
      </div>
      <p class="all-boards">
        all boards <span v-if="boards">({{ boards.length }})</span>
      </p>
      <div class="sm:flex sm:flex-col grow">
        <ul v-if="boards != null" class="boards-list">
          <board-label
            @click="() => changeCurrentBoard(board)"
            v-for="(board, index) in boards"
            :key="index"
            :name="board.name"
            tabindex="0"
            :class="{
              'bg-purple-400 fill-white text-white': board.name === boardName,
              'text-gray-400 fill-gray-400': board.name !== boardName
            }"
          />
        </ul>
        <p v-else class="px-4 text-gray-400 text-center">
          There are no boards to display
        </p>
        <board-label
          @keydown.enter="isAddBoardDialogShown = true"
          @click="isAddBoardDialogShown = true"
          name="+ Create New Board"
          tabindex="0"
          class="text-purple-400 fill-purple-400"
        />
      </div>
      <div class="mt-auto">
        <theme-toggle
          class="mt-4 w-[90%] bg-blue-200 dark:bg-gray-800 rounded-md"
        />
        <board-label
          @click="$emit('toggle-sidebar')"
          @keydown.enter="$emit('toggle-sidebar')"
          name="Hide Sidebar"
          tabindex="0"
          class="hidden sm:flex my-2 text-gray-400 fill-gray-400"
        />
      </div>
    </nav>
  </transition>
  <transition name="dialog">
    <board-dialog
      v-if="isAddBoardDialogShown"
      @close-dialog="isAddBoardDialogShown = false"
      action="add"
      :selectedMultiOptionItems="['Todo', 'Doing']"
    />
  </transition>
</template>

<script setup lang="ts">
import type { Board } from '../../api/boardsTypes'
import ThemeToggle from '../shared/ThemeToggle.vue'
import BoardLabel from './BoardLabel.vue'
import BoardDialog from '../Dialogs/BoardDialog.vue'
import LogoIcon from '../Svgs/LogoIcon.vue'
import { useBoardsNewStore } from '../../stores/boardsNew'
import { ref } from 'vue'

defineProps<{
  condition: boolean
  boards: Board[] | null
  boardName: Board['name']
}>()
defineEmits(['toggle-sidebar'])

const isAddBoardDialogShown = ref(false)
const boardsNewStore = useBoardsNewStore()

const changeCurrentBoard = (board: Board) => {
  boardsNewStore.chosenBoard = board
  localStorage.setItem(
    'currentBoard',
    JSON.stringify(boardsNewStore.chosenBoard)
  )
}
</script>

<style lang="postcss" scoped>
.create-board {
  @apply mx-auto px-4 py-2 w-[max-content] text-purple-400 rounded-3xl;
  @apply outline outline-transparent hover:bg-white focus-visible:bg-white;
  @apply transition-colors duration-300;
}

.boards {
  @apply absolute top-[calc(12vh+1rem)] right-1/2 py-4 translate-x-1/2 w-[70vw];
  @apply rounded-lg shadow-sm bg-white dark:bg-gray-700 sm:scale-100 z-50;
}

@screen sm {
  .boards {
    @apply static translate-x-0 w-auto;
    @apply row-span-2 flex flex-col pt-4 rounded-none shadow-xs;
  }
}

.all-boards {
  @apply ml-3 xs:ml-6 mb-[20px] text-xs text-gray-400;
  @apply uppercase tracking-[2.4px] font-normal;
}

.boards-list {
  @apply grid max-h-[calc(100vh-310px)] overflow-auto;
  @apply scrollbar-visibleLight dark:scrollbar-visibleDark;
}

.nav-enter-from,
.nav-leave-to {
  @apply origin-top opacity-50 scale-0;
}

@screen sm {
  .nav-enter-from,
  .nav-leave-to {
    @apply -translate-x-full scale-100;
  }
}

.nav-enter-active,
.nav-leave-active {
  @apply transition-all duration-500;
}
</style>

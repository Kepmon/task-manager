<template>
  <transition name="nav">
    <nav
      v-if="!boardsStore.isLoading && condition"
      aria-label="boards navigation"
      class="boards"
    >
      <p class="all-boards">
        all boards <span v-if="boards">({{ boards.length }})</span>
      </p>
      <div>
        <ul v-if="boards.length !== 0" class="boards-list">
          <li v-for="(board, index) in boards" :key="index">
            <board-label
              @click="() => (boardsStore.chosenBoard = board)"
              :name="board.name"
              tabindex="0"
              :class="{
                'bg-purple-400 fill-white text-white': board.name === boardName,
                'text-gray-400 fill-gray-400': board.name !== boardName
              }"
            />
          </li>
        </ul>
        <p v-else class="py-4 ml-5 text-gray-400">
          There are no boards to display
        </p>
        <board-label
          @keydown.enter="isAddBoardModalShown = true"
          @click="isAddBoardModalShown = true"
          name="Create New Board"
          :isPlusSignAdded="true"
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
  <transition name="modal">
    <board-modal
      v-if="isAddBoardModalShown"
      @close-modal="isAddBoardModalShown = false"
      action="add"
    />
  </transition>
</template>

<script setup lang="ts">
import type { Board } from '../../api/boardsTypes'
import ThemeToggle from '../shared/ThemeToggle.vue'
import BoardLabel from './BoardLabel.vue'
import BoardModal from '../Modals/BoardModal.vue'
import { useBoardsStore } from '../../stores/boards'
import { ref } from 'vue'

defineProps<{
  boards: Board[]
  boardName: Board['name']
  condition: boolean
}>()
defineEmits(['toggle-sidebar'])

const isAddBoardModalShown = ref(false)
const boardsStore = useBoardsStore()
</script>

<style lang="postcss" scoped>
.boards {
  @apply absolute top-[calc(12vh+1rem)] right-1/2 py-4 translate-x-1/2 w-[70vw];
  @apply rounded-lg bg-white dark:bg-gray-700 sm:scale-100 z-50;
  @apply border-r border-blue-300 dark:border-gray-600;
}

@screen sm {
  .boards {
    @apply static translate-x-0 w-auto;
    @apply row-span-2 flex flex-col pt-4 rounded-none;
  }
}

.all-boards {
  @apply ml-3 xs:ml-6 mb-[20px] text-xs text-gray-400;
  @apply uppercase tracking-[2.4px] font-normal;
}

.boards-list {
  @apply grid max-h-[calc(100vh-310px)];
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

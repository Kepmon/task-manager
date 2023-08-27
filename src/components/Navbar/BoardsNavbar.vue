<template>
  <transition
    @after-enter="afterEnter"
    :name="noAnimation && width >= 640 ? undefined : 'nav'"
  >
    <nav v-if="!userStore.isLoading && condition" class="boards">
      <p class="all-boards">all boards ({{ boards.length }})</p>
      <div>
        <ul v-if="boards.length !== 0" class="boards-list">
          <li v-for="(board, index) in boards" :key="index">
            <board-label
              @click="() => saveCurrentBoard(board)"
              :name="board.name"
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
          @click="isAddBoardModalShown = true"
          name="Create New Board"
          :isPlusSignAdded="true"
          class="text-purple-400 fill-purple-400"
        />
      </div>
      <div class="mt-auto">
        <theme-toggle
          class="mt-4 w-[90%] bg-blue-200 dark:bg-gray-800 rounded-md"
        />
        <board-label
          v-if="width > 640"
          @click="$emit('toggle-sidebar')"
          name="Hide Sidebar"
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
import { useUserStore } from '../../stores/user'
import { useBoardsStore } from '../../stores/boards'
import { ref } from 'vue'

defineProps<{
  boards: Board[]
  boardName: Board['name']
  condition: boolean
  width: number
}>()
const emits = defineEmits(['toggle-sidebar', 'close-boards-navbar'])

const isAddBoardModalShown = ref(false)
const userStore = useUserStore()
const boardsStore = useBoardsStore()

const noAnimation = ref(true)
const afterEnter = () => {
  noAnimation.value = false
}

const saveCurrentBoard = async (board: Board) => {
  emits('close-boards-navbar')

  boardsStore.currentBoard = board
  localStorage.setItem(
    `currentBoard-${userStore.userID}`,
    JSON.stringify(boardsStore.currentBoard)
  )

  await boardsStore.getColumns()
}
</script>

<style lang="postcss" scoped>
.boards {
  @apply absolute top-[calc(12vh+1rem)] right-1/2 py-4 translate-x-1/2 w-[80vw];
  @apply rounded-lg bg-white dark:bg-gray-700 sm:scale-100 z-50 sm:z-0;
  @apply border-r border-gray-350 dark:border-gray-600;
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

.nav-enter-active,
.nav-leave-active {
  @apply transition-transform duration-500 ease-out;
}

@screen sm {
  .nav-enter-from,
  .nav-leave-to {
    @apply -translate-x-full scale-100;
  }

  .nav-enter-active,
  .nav-leave-active {
    @apply transition-transform duration-100 ease-out;
  }
}
</style>

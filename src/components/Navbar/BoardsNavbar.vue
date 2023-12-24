<template>
  <transition
    :name="
      (noDesktopAnimation && width >= 640) || (noMobileAnimation && width < 640)
        ? undefined
        : 'nav'
    "
  >
    <logo-icon
      v-if="
        isDashboardEmpty && !userStore.isLoading && width >= 640
          ? isSidebarShown
          : isNavOpen
      "
      :isSidebarShown="isSidebarShown"
      class="bg-white dark:bg-gray-700"
    />
  </transition>
  <transition
    @after-enter="afterEnter"
    @after-leave="afterLeave"
    :name="
      (noDesktopAnimation && width >= 640) || (noMobileAnimation && width < 640)
        ? undefined
        : 'nav'
    "
  >
    <nav
      v-if="!userStore.isLoading && width >= 640 ? isSidebarShown : isNavOpen"
      class="boards"
    >
      <div class="board-labels-container">
        <p class="all-boards">all boards ({{ allBoards.length }})</p>
        <ul
          v-if="allBoards.length > 0"
          class="overflow-auto scrollbar-invisible hover:scrollbar-visibleLight dark:hover:scrollbar-visibleDark"
        >
          <li v-for="board in allBoards" :key="board.boardID">
            <board-label
              @click="() => saveCurrentBoard(board)"
              :name="board.name"
              :aria-current="
                board.boardID === currentBoard.boardID ? 'true' : undefined
              "
              :class="{
                'bg-purple-400 fill-white text-white':
                  board.boardID === currentBoard.boardID,
                'text-gray-400 fill-gray-400':
                  board.boardID !== currentBoard.boardID
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
      <div class="self-end">
        <theme-toggle
          class="mt-4 w-[90%] bg-blue-200 dark:bg-gray-800 rounded-md"
        />
        <board-label
          @click="$emit('toggle-sidebar')"
          name="Hide Sidebar"
          class="hidden sm:flex text-gray-400 fill-gray-400"
        />
      </div>
    </nav>
  </transition>
  <transition name="modal">
    <board-modal
      v-if="isAddBoardModalShown"
      @change-var-to-false="isAddBoardModalShown = false"
      action="add"
    />
  </transition>
</template>

<script setup lang="ts">
import type { Board } from '../../api/boardsTypes'
import ThemeToggle from '../shared/ThemeToggle.vue'
import BoardLabel from './BoardLabel.vue'
import BoardModal from '../Modals/BoardModal.vue'
import LogoIcon from '../../components/Svgs/LogoIcon.vue'
import { handleResponse } from '../../composables/responseHandler'
import { useUserStore } from '../../stores/user'
import { useBoardsStore } from '../../stores/boards'
import { ref, computed } from 'vue'

const props = defineProps<{
  boards: Board[]
  boardName: Board['name']
  width: number
  isSidebarShown: boolean
  isNavOpen: boolean
  isDashboardEmpty: boolean
}>()
const emits = defineEmits(['toggle-sidebar', 'close-boards-navbar'])

const isAddBoardModalShown = ref(false)
const userStore = useUserStore()
const boardsStore = useBoardsStore()

const allBoards = computed(() => userStore.userData.allBoards)
const currentBoard = computed(() => userStore.userData.currentBoard)

const noDesktopAnimation = ref(true)
const noMobileAnimation = ref(false)
const afterEnter = () => {
  if (props.width < 640 && props.isNavOpen) {
    noMobileAnimation.value = false
  }

  if (props.width < 640 && props.isSidebarShown) {
    noDesktopAnimation.value = false
    return
  }

  if (props.width < 640 && !props.isSidebarShown) {
    noDesktopAnimation.value = true
    return
  }

  if (props.isNavOpen) {
    noMobileAnimation.value = false
  }

  noMobileAnimation.value = true
  noDesktopAnimation.value = false
}
const afterLeave = () => {
  if (props.width > 640 && !props.isSidebarShown) {
    noDesktopAnimation.value = false
  }

  if (props.width > 640 && props.isNavOpen) {
    noMobileAnimation.value = true
    return
  }

  if (props.width > 640 && !props.isNavOpen) {
    noMobileAnimation.value = false
    return
  }

  if (props.isSidebarShown) {
    noDesktopAnimation.value = true
  }

  if (!props.isSidebarShown) {
    noDesktopAnimation.value = false
  }

  noMobileAnimation.value = false
}

const saveCurrentBoard = async (board: Board) => {
  emits('close-boards-navbar')
  const response = await boardsStore.saveCurrentBoard(board)
  handleResponse(response)
}
</script>

<style lang="postcss" scoped>
.boards {
  @apply grid grid-rows-[calc(100%-112px)_auto];
  @apply absolute top-[70px] right-1/2 py-4 translate-x-1/2 w-[80vw] max-h-[calc(100vh-82px)];
  @apply rounded-lg bg-white dark:bg-gray-700 sm:scale-100 z-50 origin-top;
  @apply border border-gray-350 dark:border-gray-600;
}

@screen sm {
  .boards {
    @apply static translate-x-0 w-auto z-0;
    @apply border-y-0 border-x-0 border-r row-span-2 grid rounded-none;
  }
}

.board-labels-container {
  @apply grid grid-rows-[auto_1fr_auto];
}

.all-boards {
  @apply ml-3 xs:ml-6 mb-[20px] text-xs text-gray-400;
  @apply uppercase tracking-[2.4px] font-normal;
}

.nav-enter-from,
.nav-leave-to {
  @apply opacity-50 scale-0;
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

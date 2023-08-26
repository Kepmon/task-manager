<template>
  <div
    class="grid grid-rows-[auto_1fr] min-h-screen"
    :class="{
      'grid-cols-[280px_1fr]': isSidebarShown,
      'grid-cols-[auto_1fr]': !isSidebarShown
    }"
  >
    <Spinner v-if="userStore.isLoading" />

    <header
      class="grid grid-cols-[auto_1fr] col-span-2 bg-white dark:bg-gray-700"
    >
      <logo-icon
        v-if="!userStore.isLoading"
        :isSidebarShown="isSidebarShown"
        aria-label="The app logo"
      />
      <the-header
        v-if="!isDashboardEmpty && !userStore.isLoading"
        @toggle-boards-nav="toggleBoardsNav"
        :isBoardEmpty="isBoardEmpty"
        :navOpen="isNavOpen"
      />
    </header>

    <boards-navbar
      @toggle-sidebar="toggleSidebar"
      :boards="boardsStore.boards"
      :boardName="boardsStore.currentBoard?.name || ''"
      :condition="windowWidth >= 640 ? isSidebarShown : isNavOpen"
      :width="windowWidth"
    />

    <div
      v-show="!isSidebarShown"
      @click="toggleSidebar"
      @keydown.enter="toggleSidebar"
      tabindex="0"
      class="show-sidebar purple-class"
    >
      <img src="/img/icon-show-sidebar.svg" alt="show sidebar" />
    </div>

    <main
      class="p-4 sm:p-6 row-start-2 col-start-2"
      :class="{
        'sm:col-start-2': isSidebarShown,
        'sm:row-start-1 sm:row-span-2': isDashboardEmpty
      }"
    >
      <boards-column
        v-if="!isDashboardEmpty && !userStore.isLoading"
        :logo="isLogoShown"
      />
      <empty-info
        v-if="!userStore.isLoading"
        :emptyDashboard="isDashboardEmpty"
        :emptyBoard="isBoardEmpty"
      />
      <user-options
        v-if="isDashboardEmpty && !userStore.isLoading"
        :isDashboardEmpty="isDashboardEmpty"
        class="absolute bottom-8 right-8 scale-125"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import LogoIcon from '../components/Svgs/LogoIcon.vue'
import TheHeader from '../components/TheHeader.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import UserOptions from '../components/UserOptions.vue'
import Spinner from '../components/Spinner.vue'
import { useUserStore } from '../stores/user'
import { useBoardsStore } from '../stores/boards'
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const userStore = useUserStore()
const boardsStore = useBoardsStore()

const isDashboardEmpty = computed(() =>
  boardsStore.boards.length === 0 ? true : false
)
const isBoardEmpty = computed(() =>
  boardsStore.boardColumnsNames && boardsStore.boardColumnsNames.length === 0
    ? true
    : false
)

const isSidebarShown = ref(true)
const isNavOpen = ref(false)
const isLogoShown = ref(false)
const toggleSidebar = () => {
  isSidebarShown.value = !isSidebarShown.value
  isLogoShown.value = false
  setTimeout(() => {
    if (!isSidebarShown.value) {
      isLogoShown.value = true
    }
  }, 500)
}
const toggleBoardsNav = () => {
  if (windowWidth.value >= 640) return

  isNavOpen.value = !isNavOpen.value
}

const { width: windowWidth } = useWindowSize()
</script>

<style lang="postcss" scoped>
.show-sidebar {
  @apply hidden sm:grid place-items-center absolute;
  @apply left-0 bottom-6 h-12 w-14 rounded-r-[100px] cursor-pointer;
}
</style>

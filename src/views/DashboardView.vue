<template>
  <div
    class="grid grid-rows-[auto_1fr] h-screen"
    :class="{
      'grid-cols-[280px_1fr]': isSidebarShown,
      'grid-cols-[auto_1fr]': !isSidebarShown
    }"
  >
    <Spinner v-if="userStore.isLoading" />

    <header
      class="col-span-2 grid grid-cols-[auto_1fr] bg-white dark:bg-gray-700"
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
      @close-boards-navbar="isNavOpen = false"
      :boards="boardsStore.boards"
      :boardName="boardsStore.currentBoard?.name || ''"
      :condition="windowWidth >= 640 ? isSidebarShown : isNavOpen"
      :width="windowWidth"
      :isSidebarOpen="isSidebarShown"
      :isNavOpen="isNavOpen"
    />
    <button
      v-if="isShownSidebarShown && windowWidth > 640"
      @click="toggleSidebar"
      aria-label="show sidebar"
      class="show-sidebar purple-class"
    >
      <img src="/img/icon-show-sidebar.svg" alt="" />
    </button>

    <main
      class="main"
      :class="{
        'sm:row-start-1 sm:row-span-2': isDashboardEmpty
      }"
    >
      <boards-column v-if="!isDashboardEmpty && !userStore.isLoading" />
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
import { ref, computed, onUnmounted } from 'vue'
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
const isShownSidebarShown = ref(false)
const isNavOpen = ref(false)
const toggleSidebar = () => {
  isSidebarShown.value = !isSidebarShown.value
  isShownSidebarShown.value = false
  setTimeout(() => {
    if (!isSidebarShown.value) {
      isShownSidebarShown.value = true
    }
  }, 100)
}
const toggleBoardsNav = () => {
  if (windowWidth.value >= 640) return

  isNavOpen.value = !isNavOpen.value
}

const closeOpenedBoardsNav = (e: Event) => {
  const isMeantToOpenMobileNav =
    (e.target as HTMLElement).closest('div')?.getAttribute('data-toggle') ===
    'boards-nav'
  if (windowWidth.value >= 640 || isMeantToOpenMobileNav) return

  const isInsideNav = (e.target as HTMLElement).closest('nav') != null
  if (!isInsideNav) {
    isNavOpen.value = false
  }
}

window.addEventListener('click', (e: Event) => {
  closeOpenedBoardsNav(e)
})
onUnmounted(() => {
  window.removeEventListener('click', (e: Event) => {
    closeOpenedBoardsNav(e)
  })
})

const { width: windowWidth } = useWindowSize()
</script>

<style lang="postcss" scoped>
.main {
  @apply p-4 sm:p-6 row-start-2 col-span-2 sm:col-start-2 h-[calc(100vh-82px)];
  @apply overflow-auto scrollbar-invisible;
  @apply hover:scrollbar-visibleLight dark:hover:scrollbar-visibleDark;
}
.show-sidebar {
  @apply grid place-items-center absolute left-0 bottom-6;
  @apply h-12 w-14 rounded-r-[100px] focus-visible:outline-white;
}
</style>

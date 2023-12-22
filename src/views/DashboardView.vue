<template>
  <div
    class="grid grid-rows-[auto_1fr] h-screen"
    :class="{
      'grid-cols-[280px_1fr]': isSidebarShown,
      'grid-cols-[auto_1fr]': !isSidebarShown
    }"
  >
    <skip-to-content v-if="!isDashboardEmpty && !userStore.isLoading" />
    <Spinner v-if="userStore.isLoading" />
    <transition name="popup">
      <confirmation-popup
        v-if="isPopupShown"
        :isResponseError="isResponseError"
      />
    </transition>

    <header
      v-if="!isDashboardEmpty && !userStore.isLoading"
      class="bg-white dark:bg-gray-700"
      :class="{ 'col-span-2 grid grid-cols-[auto_1fr]': !isDashboardEmpty }"
    >
      <logo-icon
        v-if="
          isDashboardEmpty
            ? isSidebarShown && !userStore.isLoading
            : !userStore.isLoading
        "
        :isSidebarShown="isSidebarShown"
      />
      <the-header
        @toggle-boards-nav="toggleBoardsNav"
        :isBoardEmpty="isBoardEmpty"
        :navOpen="isNavOpen"
        :width="windowWidth"
      />
    </header>

    <boards-navbar
      @toggle-sidebar="toggleSidebar"
      @close-boards-navbar="isNavOpen = false"
      :boards="boardsStore.boards"
      :boardName="boardsStore.currentBoard?.name || ''"
      :width="windowWidth"
      :isSidebarShown="isSidebarShown"
      :isNavOpen="isNavOpen"
      :isDashboardEmpty="isDashboardEmpty"
    />
    <button
      v-if="isOpenSidebarShown && windowWidth > 640"
      @click="toggleSidebar"
      aria-label="show sidebar"
      class="show-sidebar purple-class"
    >
      <img src="/img/icon-show-sidebar.svg" alt="" />
    </button>

    <main
      class="main"
      :class="{
        'sm:row-start-1 sm:row-span-2 min-h-screen': isDashboardEmpty,
        'sm:row-start-2 sm:row-span-1 min-h-[calc(100vh-82px)]':
          !isDashboardEmpty
      }"
    >
      <boards-column
        v-if="!isDashboardEmpty && !isBoardEmpty && !userStore.isLoading"
      />
      <empty-info
        v-if="(isDashboardEmpty || isBoardEmpty) && !userStore.isLoading"
        :emptyDashboard="isDashboardEmpty"
        :width="windowWidth"
      />
      <user-options
        v-if="isDashboardEmpty && !userStore.isLoading"
        :isDashboardEmpty="isDashboardEmpty"
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
import SkipToContent from '../components/SkipToContent.vue'
import ConfirmationPopup from '../components/shared/ConfirmationPopup.vue'
import { useUserStore } from '../stores/user'
import { useBoardsStore } from '../stores/boards'
import { isPopupShown, isResponseError } from '../composables/responseHandler'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

const userStore = useUserStore()
const boardsStore = useBoardsStore()

const isDashboardEmpty = computed(() => userStore.userData.length === 0)
const isBoardEmpty = computed(
  () => userStore.userData[0].currentBoard.boardColumns.length === 0
)

const isSidebarShown = ref(true)
const isOpenSidebarShown = ref(false)
const isNavOpen = ref(false)
const toggleSidebar = () => {
  isSidebarShown.value = !isSidebarShown.value

  isOpenSidebarShown.value = false
  setTimeout(() => {
    if (!isSidebarShown.value) {
      isOpenSidebarShown.value = true
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

onMounted(() => {
  window.addEventListener('click', closeOpenedBoardsNav)
})
onUnmounted(() => {
  window.removeEventListener('click', closeOpenedBoardsNav)
})

const { width: windowWidth } = useWindowSize()
</script>

<style lang="postcss" scoped>
.main {
  @apply col-span-2 sm:col-start-2;
  @apply overflow-y-auto scrollbar-invisible;
  @apply hover:scrollbar-visibleLight dark:hover:scrollbar-visibleDark;
}
.show-sidebar {
  @apply grid place-items-center absolute left-0 bottom-6;
  @apply h-12 w-14 rounded-r-[100vmax];
}
</style>

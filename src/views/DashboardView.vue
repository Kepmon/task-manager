<template>
  <div class="main-container">
    <Spinner v-if="boardsStore.isLoading" />

    <boards-navbar
      v-if="
        !isDashboardEmpty && !boardsStore.isLoading && windowWidth >= 640
          ? true
          : isNavOpen
      "
      @toggle-sidebar="toggleSidebar"
      :boards="boardsStore.boards"
      :boardName="boardsStore.currentBoard?.name || ''"
      :isLoading="boardsStore.isLoading"
    />

    <main-navbar
      v-if="!isDashboardEmpty && !boardsStore.isLoading"
      @toggle-boards-nav="toggleBoardsNav"
      :sidebar="isSidebarShown"
      :isLogo="isLogoShown"
      :isBoardEmpty="isBoardEmpty"
      :areOptionsShown="areBoardOptionsShown"
      :navOpen="isNavOpen"
    />

    <div
      v-show="isLogoShown"
      @click="toggleSidebar"
      @keydown.enter="toggleSidebar"
      tabindex="0"
      class="show-sidebar purple-class hidden sm:block"
    >
      <img src="/img/icon-show-sidebar.svg" alt="show sidebar" />
    </div>

    <main
      class="p-4 sm:p-6"
      :class="{
        'sm:col-start-2': !isLogoShown,
        'sm:col-start-1 sm:col-span-2': isLogoShown,
        'sm:row-start-1 sm:row-span-2': isDashboardEmpty
      }"
    >
      <boards-column
        v-if="!isDashboardEmpty && !boardsStore.isLoading"
        :logo="isLogoShown"
      />
      <empty-info
        v-if="!boardsStore.isLoading"
        :emptyDashboard="isDashboardEmpty"
        :emptyBoard="isBoardEmpty"
      />
      <user-options
        v-if="isDashboardEmpty && !boardsStore.isLoading"
        :isDashboardEmpty="isDashboardEmpty"
        class="absolute bottom-8 right-8 scale-125"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import UserOptions from '../components/UserOptions.vue'
import Spinner from '../components/Spinner.vue'
import { useBoardsStore } from '../stores/boards'
import { ref, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

const boardsStore = useBoardsStore()
onMounted(async () => {
  await boardsStore.getColumns()
})

const isDashboardEmpty = computed(() =>
  boardsStore.boards.length === 0 ? true : false
)
const isBoardEmpty = computed(() =>
  boardsStore.boardColumnsNames && boardsStore.boardColumnsNames.length === 0
    ? true
    : false
)
const areBoardOptionsShown = ref(false)

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
  if (windowWidth.value >= 640) {
    return
  }
  isNavOpen.value = !isNavOpen.value
}

const { width: windowWidth } = useWindowSize()
</script>

<style lang="postcss" scoped>
.main-container {
  @apply grid grid-rows-[80px_calc(100vh-80px)];
  @apply sm:grid-cols-[33%_67%] lg:grid-cols-[25%_75%] xl:grid-cols-[20%_80%];
}

.show-sidebar {
  @apply flex items-center justify-center absolute left-0 bottom-6;
  @apply h-12 w-14 rounded-r-[100px] cursor-pointer;
}
</style>

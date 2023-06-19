<template>
  <div class="main-container">
    <boards-navbar
      v-bind="boardsNavbarProps"
    />

    <main-navbar
      :sidebar="isSidebarShown"
      :isLogo="isLogoShown"
      :theme="isDark"
      :dashboard="isDashboardEmpty"
      :width="windowWidth"
      :boardName="boardProperties.boardName"
      :areOptionsShown="areBoardOptionsShown"
      :navOpen="isNavOpen"
      :toggleBoardsNav="toggleBoardsNav"
    />

    <div
      @click="toggleSidebar"
      @keydown.enter="toggleSidebar"
      v-show="isLogoShown && windowWidth >= 640"
      tabindex="0"
      class="show-sidebar purple-class">
      <img src="/img/icon-show-sidebar.svg" alt="show sidebar">
    </div>

    <main
      class="flex flex-col justify-center p-4 sm:p-6 "
      :class="{ 'sm:col-start-2': !isLogoShown, 'sm:col-start-1 sm:col-span-2': isLogoShown }"
    > 
      <empty-info />

      <boards-column
        :columns="boardProperties.columns"
        :logo="isLogoShown"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import { returnBoardProperties } from '../composables/boardProperties'
import { ref, computed } from 'vue'
import { useDark, useWindowSize } from '@vueuse/core'

const isDark = useDark()
const isDashboardEmpty = ref(false)
const boardProperties = returnBoardProperties()

const areBoardOptionsShown = ref(false)
const boardsNavbarProps = computed(() => ({
  condition: windowWidth.value < 640 ? isNavOpen.value : isSidebarShown.value,
  width: windowWidth.value,
  theme: isDark.value,
  boards: boardProperties.boards,
  boardName: boardProperties.boardName,
  toggleSidebar: toggleSidebar
}))

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

<style scoped>
.main-container {
  @apply grid grid-rows-[80px_calc(100vh-80px)];
  @apply sm:grid-cols-[33%_67%] min-[896px]:grid-cols-[25%_75%] xl:grid-cols-[20%_80%]
}

.show-sidebar {
  @apply flex items-center justify-center absolute left-0 bottom-6;
  @apply h-12 w-14 rounded-r-[100px] cursor-pointer;
}
</style>
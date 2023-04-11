<template>
  <div class="nav-container">
      <boards-navbar
        v-show="isNavOpen"
        :width="width"
        :theme="isDark"
        class="absolute sm:scale-0"
      />
      <boards-navbar
        v-show="isSidebarShown"
        :width="width"
        :theme="isDark"
        :callback="toggleSidebar"
        class="scale-0 sm:scale-100"
      />
      <main-navbar
        @click="isNavOpen = !isNavOpen"
        :sidebar="isSidebarShown"
        :isLogo="isLogoShown"
        :theme="isDark"
        :dashboard="isDashboardEmpty"
        :width="width"
        :class="{ 'col-span-2': isLogoShown }"
      />
  
      <div
        @click="toggleSidebar"
        v-show="isLogoShown && width >= 640"
        class="show-sidebar">
        <img src="/img/icon-show-sidebar.svg" alt="show sidebar">
      </div>

      <empty-info
        v-show="activeBoard.columns.length === 0"
        whatIsEmpty="This board"
        createNew="column"
        :logo="isLogoShown"
        buttonText="Add New Column"
      />
      
      <empty-info
        v-show="boards.length === 0"
        whatIsEmpty="Your dashboard"
        createNew="board"
        :logo="isLogoShown"
        buttonText="Add New Board"
      />
  </div>
</template>

<script setup lang="ts">
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import { useBoardsStore } from '../stores/boards.ts'
import { ref } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark()
const isDashboardEmpty = ref(true)
const isNavOpen = ref(false)

const { boards } = useBoardsStore()
const activeBoard = boards[0]

const isSidebarShown = ref(true)
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

const width = ref(window.innerWidth)
const resizeObserwer = new ResizeObserver((entries) => {
  width.value = entries[0].contentRect.width
})
resizeObserwer.observe(document.body)
</script>

<style scoped>
.nav-container {
  @apply grid grid-rows-[12vh_1fr] h-screen overflow-hidden;
  @apply sm:grid-cols-[1fr_2fr] min-[896px]:grid-cols-[1fr_3fr] xl:grid-cols-[1fr_4fr];
}

.show-sidebar {
  @apply flex items-center justify-center absolute left-0 bottom-6;
  @apply h-12 w-14 rounded-r-[100px] bg-main-purple cursor-pointer;
}
</style>
<template>
  <div class="main-container">
    <boards-navbar
      v-show="isNavOpen"
      :width="windowWidth"
      :theme="isDark"
      :boards="boards"
      :boardName="activeBoard.name"
      class="absolute sm:scale-0"
    />
    <boards-navbar
      v-show="isSidebarShown"
      :width="windowWidth"
      :theme="isDark"
      :boards="boards"
      :boardName="activeBoard.name"
      :callback="toggleSidebar"
      class="scale-0 sm:scale-100"
    />
    <main-navbar
      @click="isNavOpen = !isNavOpen"
      :sidebar="isSidebarShown"
      :isLogo="isLogoShown"
      :theme="isDark"
      :dashboard="isDashboardEmpty"
      :width="windowWidth"
      :boardName="activeBoard.name"
      :class="{ 'col-span-2': isLogoShown }"
    />
  
    <div
      @click="toggleSidebar"
      v-show="isLogoShown && windowWidth >= 640"
      class="show-sidebar">
      <img src="/img/icon-show-sidebar.svg" alt="show sidebar">
    </div>

    <main
      class="flex flex-col justify-center p-4 sm:p-6"
      :class="{ 'sm:col-start-2': !isLogoShown, 'sm:col-start-1 sm:col-span-2': isLogoShown }"
    >
      <empty-info
        v-show="activeBoard.columns.length === 0"
        whatIsEmpty="This board"
        createNew="column"
        buttonText="Add New Column"
      />
      
      <empty-info
        v-show="boards.length === 0"
        whatIsEmpty="Your dashboard"
        createNew="board"
        buttonText="Add New Board"
      />

      <boards-column
        :columns="activeBoard.columns"
        :logo="isLogoShown"
        :callback="toggleSeeTask"
      />
    </main>

    <see-task
      @click.prevent.self="toggleSeeTask"
      v-show="isSeeTaskOpen"
      :title="activeBoard.columns[1].tasks[5].title"
      :description="activeBoard.columns[1].tasks[5].description"
      :howManyCompleted="
        returnNumberOfCompletedSubtasks(activeBoard.columns[1].tasks[5].subtasks)
      "
      :howManySubtasks="activeBoard.columns[1].tasks[5].subtasks.length"
      :subtasks="activeBoard.columns[1].tasks[5].subtasks"
      :columns="activeBoard.columns"
      :status="activeBoard.columns[1].tasks[5].status"
    />
  </div>
</template>

<script setup lang="ts">
import type { Board } from '../api/boardsTypes'
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import SeeTask from '../components/Dialogs/SeeTask.vue'
import { returnNumberOfCompletedSubtasks } from '../composables/completedTasks'
import { useBoardsStore } from '../stores/boards'
import { ref } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark()
const isDashboardEmpty = ref(true)
const isNavOpen = ref(false)

const isSeeTaskOpen = ref(false)
const toggleSeeTask = () => {
  isSeeTaskOpen.value = !isSeeTaskOpen.value
}

const { boards }: { boards: Board[] } = useBoardsStore()
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

const windowWidth = ref(window.innerWidth)
const resizeObserwer = new ResizeObserver((entries) => {
  windowWidth.value = entries[0].contentRect.width
})
resizeObserwer.observe(document.body)
</script>

<style scoped>
.main-container {
  @apply grid grid-rows-[12vh_88vh] min-h-screen;
  @apply sm:grid-cols-[33%_67%] min-[896px]:grid-cols-[25%_75%] xl:grid-cols-[20%_80%]
}

.show-sidebar {
  @apply flex items-center justify-center absolute left-0 bottom-6;
  @apply h-12 w-14 rounded-r-[100px] bg-main-purple cursor-pointer;
}
</style>
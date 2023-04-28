<template>
  <div class="main-container">
    <boards-navbar
      v-show="isNavOpen"
      :width="windowWidth"
      :theme="isDark"
      :boards="boardProperties.boards"
      :boardName="boardProperties.boardName"
      class="absolute sm:scale-0"
    />
    <boards-navbar
      v-show="isSidebarShown"
      :width="windowWidth"
      :theme="isDark"
      :boards="boardProperties.boards"
      :boardName="boardProperties.boardName"
      :callback="toggleSidebar"
      class="scale-0 sm:scale-100"
    />
    <main-navbar
      :sidebar="isSidebarShown"
      :isLogo="isLogoShown"
      :theme="isDark"
      :dashboard="isDashboardEmpty"
      :width="windowWidth"
      :boardName="boardProperties.boardName"
      :areOptionsShown="areBoardOptionsShown"
      :toggleDialog="toggleDialog"
      :callback="toggleOptions"
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
        v-show="boardProperties.columns.length === 0"
        whatIsEmpty="This board"
        createNew="column"
        buttonText="Add New Column"
      />
      
      <empty-info
        v-show="boardProperties.boards.length === 0"
        whatIsEmpty="Your dashboard"
        createNew="board"
        buttonText="Add New Board"
      />

      <boards-column
        :columns="boardProperties.columns"
        :logo="isLogoShown"
        :callback="toggleDialog"
      />
    </main>

    <dialogs-template
      v-show="isDialogOpen"
      :areOptionsShown="areTaskOptionsShown"
      :isDark="isDark"
      formType="SeeTask"
      modifiedItem="Task"
      :selectedStatus="boardProperties.status"
      :toggleDialog="toggleDialog"
    />
  </div>
</template>

<script setup lang="ts">
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import DialogsTemplate from '../components/Dialogs/DialogsTemplate.vue'
import { returnBoardProperties } from '../composables/boardProperties'
import { ref } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark()
const isDashboardEmpty = ref(false)
const boardProperties = returnBoardProperties()

const isNavOpen = ref(false)
const areBoardOptionsShown = ref(false)
const areTaskOptionsShown = ref(false)
const toggleOptions = () => {
  if (windowWidth.value < 640) {
    isNavOpen.value = !isNavOpen.value
    return
  }
  areBoardOptionsShown.value = !areBoardOptionsShown.value
}

const isDialogOpen = ref(false)
const toggleDialog = () => {
  isDialogOpen.value = !isDialogOpen.value
}

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
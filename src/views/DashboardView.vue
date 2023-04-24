<template>
<div class="main-container">
  <boards-navbar
    v-show="isNavOpen"
    :width="windowWidth"
    :theme="isDark"
    :boards="boards"
    :boardName="boardName"
    class="absolute sm:scale-0"
  />
  <boards-navbar
    v-show="isSidebarShown"
    :width="windowWidth"
    :theme="isDark"
    :boards="boards"
    :boardName="boardName"
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
    :boardName="boardName"
    :callback="() => toggleDialog(dialogsToToggle, 'addEditDialog')"
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
      v-show="columns.length === 0"
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
      :columns="columns"
      :logo="isLogoShown"
      :callback="() => toggleDialog(dialogsToToggle, 'seeTask')"
    />
  </main>

  <all-dialogs
    :isDark="isDark"
    :isSeeTaskOpen="dialogsToToggle.seeTask.isOpen"
    :toggleSeeTask="() => toggleDialog(dialogsToToggle, 'seeTask')"
    :isAddEditDialogOpen="dialogsToToggle.addEditDialog.isOpen"
    :toggleAddNewTask="() => toggleDialog(dialogsToToggle, 'addEditDialog')"
    :isDeleteDialogOpen="dialogsToToggle.deleteDialog.isOpen"
    :toggleDeleteDialog="() => toggleDialog(dialogsToToggle, 'deleteDialog')"
    :name="boardName"
    :columns="columns"
    :title="title"
    :description="description"
    :status="status"
    :subtasks="subtasks"
  />
</div>
</template>

<script setup lang="ts">
import type { Board } from '../api/boardsTypes'
import type { DialogCondition } from '../api/dialogsTypes'
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import AllDialogs from '../components/Dialogs/AllDialogs.vue'
import { useBoardsStore } from '../stores/boards'
import { ref } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark()
const isDashboardEmpty = ref(false)
const isNavOpen = ref(false)

const dialogsToToggle = ref({
  seeTask: {
    isOpen: false
  },
  addEditDialog: {
    isOpen: false
  },
  deleteDialog: {
    isOpen: false
  }
})

const toggleDialog = (itemToOpen: DialogCondition, key: string) => {
  const property = key as keyof DialogCondition
  itemToOpen[property].isOpen = !itemToOpen[property].isOpen
}

const { boards }: { boards: Board[] } = useBoardsStore()
const { name: boardName, columns } = boards[0]
const { tasks } = columns[1]
const { title, description, status, subtasks } = tasks[5]

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
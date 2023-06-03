<template>
  <div class="main-container">
    <boards-navbar
      v-bind="boardsNavbarProps"
      :class="{
        'absolute sm:scale-0': windowWidth < 640,
        'scale-0 sm:scale-100': windowWidth >= 640
      }"
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
      :toggleOptions="($event) => callMoreOptionsFn($event, toggleOptions)"
      :closeOptions="($event) => callMoreOptionsFn($event, closeOptions)"
      :toggleBoardsNav="toggleBoardsNav"
      :addTask="() => toggleDialog('addTask')"
      :editTask="() => toggleDialog('editTask')"
      :editBoard="() => toggleDialog('editBoard')"
      :deleteTask="() => toggleDialog('deleteTask')"
      :deleteBoard="() => toggleDialog('deleteBoard')"
      :class="{ 'col-span-2': isLogoShown }"
    />

    <div
      @click="toggleSidebar"
      v-show="isLogoShown && windowWidth >= 640"
      class="show-sidebar">
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
        :callback="() => toggleDialog('seeTask')"
      />

      <dialogs-template
        v-bind="dialogProps"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { SharedProps, ToggledDialog, PropsToSelect } from '../api/dialogTypes'
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import DialogsTemplate from '../components/Dialogs/DialogsTemplate.vue'
import { returnBoardProperties } from '../composables/boardProperties'
import { returnDialogPropsToSelect } from '../composables/dialogHandling'
import moreOptionsPopup from '../composables/moreOptionsPopup'
import { ref, Ref, computed } from 'vue'
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
  toggleSidebar: toggleSidebar,
  addNewBoard: () => toggleDialog('addBoard')
}))
const { toggleOptions, closeOptions } = moreOptionsPopup
const callMoreOptionsFn = (e: Event, cb: (e: Event, conditionToChange: Ref<boolean>) => void) => {
  cb(e, areBoardOptionsShown)
}

const propsToSelect = returnDialogPropsToSelect()
const toggledDialog: Ref<ToggledDialog> = ref('seeTask')
const isDialogOpen = ref(false)
const dialogProps = computed(() => {
  const sharedProps: SharedProps = {
    isDark: isDark.value,
    toggleDialog,
    editTask: () => toggleDialog('editTask'),
    editBoard: () => toggleDialog('editBoard'),
    deleteTask: () => toggleDialog('deleteTask'),
    deleteBoard: () => toggleDialog('deleteBoard'),
    condition: isDialogOpen.value
  }
  const selectedProps = propsToSelect[toggledDialog.value as keyof PropsToSelect]

  return { ...sharedProps, ...selectedProps }
})
const toggleDialog = (formType?: ToggledDialog) => {
  if (formType) {
    toggledDialog.value = formType
  }
  
  if (formType === 'editTask' || formType === 'deleteTask') {
    isDialogOpen.value = true
    return
  }
  
  isDialogOpen.value = !isDialogOpen.value
}

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

const { width } = useWindowSize()
const windowWidth = ref(width)
const resizeObserver = new ResizeObserver((entries) => {
  windowWidth.value = entries[0].contentRect.width
})
resizeObserver.observe(document.body)
</script>

<style scoped>
.main-container {
  @apply grid grid-rows-[80px_calc(100vh-80px)];
  @apply sm:grid-cols-[33%_67%] min-[896px]:grid-cols-[25%_75%] xl:grid-cols-[20%_80%]
}

.show-sidebar {
  @apply flex items-center justify-center absolute left-0 bottom-6;
  @apply h-12 w-14 rounded-r-[100px] bg-main-purple cursor-pointer;
  @apply hover:bg-main-purple-hover transition-all duration-300;
}
</style>
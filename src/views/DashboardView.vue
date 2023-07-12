<!-- eslint-disable prettier/prettier -->
<template>
  <div class="main-container">
    <div v-if="isLoading" class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    <transition name="popup">
      <confirmation-popup v-if="isConfirmationPopupShown" :isError="boardErrors.add" action="add" element="board" />
    </transition>

    <boards-navbar v-if="!isLoading" @toggle-sidebar="toggleSidebar" v-bind="boardsNavbarProps" />

    <main-navbar
      v-if="!isDashboardEmpty"
      @toggle-boards-nav="toggleBoardsNav"
      :sidebar="isSidebarShown"
      :isLogo="isLogoShown"
      :isBoardEmpty="isBoardEmpty"
      :areOptionsShown="areBoardOptionsShown"
      :navOpen="isNavOpen"
    />

    <div
      v-show="isLogoShown && windowWidth >= 640"
      @click="toggleSidebar"
      @keydown.enter="toggleSidebar"
      tabindex="0"
      class="show-sidebar purple-class"
    >
      <img src="/img/icon-show-sidebar.svg" alt="show sidebar" />
    </div>

    <main
      class="flex flex-col justify-center p-4 sm:p-6"
      :class="{
        'sm:col-start-2': !isLogoShown,
        'sm:col-start-1 sm:col-span-2': isLogoShown,
        'sm:row-start-1 sm:row-span-2': isDashboardEmpty
      }"
    >
      <boards-column
        v-if="!isDashboardEmpty"
        :selectedMultiOptionItems="['Todo', 'Doing']"
        :columns="boardColumns"
        :logo="isLogoShown"
      />
      <empty-info
        v-if="!isLoading"
        :emptyDashboard="isDashboardEmpty"
        :emptyBoard="isBoardEmpty"
      />
      <user-options
        v-if="isDashboardEmpty && !isLoading"
        :isDashboardEmpty="isDashboardEmpty"
        class="absolute bottom-8 right-8 scale-125"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Board } from '../api/boardsTypes'
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import UserOptions from '../components/UserOptions.vue'
import ConfirmationPopup from '../components/shared/ConfirmationPopup.vue'
import { useUserStore } from '../stores/user'
import { useBoardsNewStore } from '../stores/boardsNew'
import { ref, toRefs, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { onSnapshot } from 'firebase/firestore'
import { colRef } from '../firebase'

const { logout } = useUserStore()
const isLoading = ref(true)

const { boards, currentBoard, isConfirmationPopupShown } = toRefs(
  useBoardsNewStore()
)
const boardColumns = ref<Board['columns']>([])
const isDashboardEmpty = computed(() =>
  boards.value.length === 0 ? true : false
)
const isBoardEmpty = ref(false)
const boardErrors = ref({
  add: false,
  edit: false,
  delete: false
})
onMounted(async () => {
  const { lastLoginAt } = JSON.parse(localStorage.getItem('user') || '{}')
  const dateNumber = parseInt(lastLoginAt)
  const lastLoggedIn = new Date(dateNumber)
  const currentDate = new Date()
  if (
    (currentDate.getTime() - lastLoggedIn.getTime()) / 1000 / 60 / 60 / 24 >=
    30
  ) {
    await logout()
    return
  }

  const { uid } = JSON.parse(localStorage.getItem('user') || '{}')
  onSnapshot(colRef, async (snapshot) => {
    try {
      const allUsers = snapshot.docs.map((doc) => doc.data())
      const currentUser = allUsers.filter((user) =>
        user.userID === uid ? user : null
      )[0]
      boards.value = currentUser['boards'] ? currentUser['boards'] : []

      if (boards.value.length > 0) {
        currentBoard.value = boards.value[0]
      }
      boardColumns.value = boards.value.map((board) => board.columns).flat()
      isLoading.value = false
    } catch (err) {
      throw new Error()
    }
  })
})

const boardName = ''
const areBoardOptionsShown = ref(false)
const boardsNavbarProps = computed(() => ({
  condition: windowWidth.value < 640 ? isNavOpen.value : isSidebarShown.value,
  boards: boards.value,
  boardName
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
  @apply sm:grid-cols-[33%_67%] lg:grid-cols-[25%_75%] xl:grid-cols-[20%_80%];
}

.show-sidebar {
  @apply flex items-center justify-center absolute left-0 bottom-6;
  @apply h-12 w-14 rounded-r-[100px] cursor-pointer;
}

.lds-roller {
  @apply absolute inset-0 m-auto w-20 aspect-square;
}
.lds-roller div {
  @apply origin-40 after:block after:absolute after:w-[7px] after:aspect-square;
  @apply after:rounded-full after:bg-white;
}
.lds-roller div:nth-child(1) {
  @apply animate-lds-roller-1 after:top-[63px] after:left-[63px];
}
.lds-roller div:nth-child(2) {
  @apply animate-lds-roller-2 after:top-[68px] after:left-[58px];
}
.lds-roller div:nth-child(3) {
  @apply animate-lds-roller-3 after:top-[71px] after:left-[48px];
}
.lds-roller div:nth-child(4) {
  @apply animate-lds-roller-4 after:top-[72px] after:left-[40px];
}
.lds-roller div:nth-child(5) {
  @apply animate-lds-roller-5 after:top-[71px] after:left-[32px];
}
.lds-roller div:nth-child(6) {
  @apply animate-lds-roller-6 after:top-[68px] after:left-[24px];
}
.lds-roller div:nth-child(7) {
  @apply animate-lds-roller-7 after:top-[63px] after:left-[17px];
}
.lds-roller div:nth-child(8) {
  @apply animate-lds-roller-8 after:top-[56px] after:left-[12px];
}
</style>

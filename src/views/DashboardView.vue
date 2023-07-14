<!-- eslint-disable prettier/prettier -->
<template>
  <div class="main-container">
    <spinner v-if="isLoading" />
    <transition name="popup">
      <confirmation-popup v-if="isConfirmationPopupShown" :isError="boardErrors.add" action="add" element="board" />
    </transition>

    <boards-navbar v-if="!isLoading" @toggle-sidebar="toggleSidebar" v-bind="boardsNavbarProps" />

    <main-navbar
      v-if="!isDashboardEmpty"
      @toggle-boards-nav="toggleBoardsNav"
      :sidebar="isSidebarShown"
      :isLogo="isLogoShown"
      :theme="isDark"
      :isBoardEmpty="isBoardEmpty"
      :width="windowWidth"
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
        :emptyDashboard="isDashboardEmpty"
        :emptyBoard="isBoardEmpty"
        :isLoading="isLoading"
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
import type { ActiveUser } from '../api/boardsTypes'
import MainNavbar from '../components/Navbar/MainNavbar.vue'
import BoardsNavbar from '../components/Navbar/BoardsNavbar.vue'
import EmptyInfo from '../components/EmptyInfo.vue'
import BoardsColumn from '../components/BoardsColumn.vue'
import UserOptions from '../components/UserOptions.vue'
import ConfirmationPopup from '../components/shared/ConfirmationPopup.vue'
import { useUserStore } from '../stores/user'
import { useBoardsNewStore } from '../stores/boardsNew'
import { ref, toRefs, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDark, useWindowSize } from '@vueuse/core'
import { User } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
import Spinner from '../components/Spinner.vue'
import { auth, colRef } from '../firebase'

const isDark = useDark()
const isLoading = ref(true)

const { boards, currentBoard, boardColumns, isConfirmationPopupShown } = toRefs(
  useBoardsNewStore()
)
const isDashboardEmpty = computed(() =>
  boards.value.length === 0 ? true : false
)
const isBoardEmpty = computed(() =>
  boardColumns.value && boardColumns.value.length === 0 ? true : false
)
const boardErrors = ref({
  add: false,
  edit: false,
  delete: false
})

const { logout } = useUserStore()
const router = useRouter()
onSnapshot(colRef, async (snapshot) => {
  try {
    const user = auth.currentUser as User
    const lastLoggedIn = user.metadata.lastSignInTime

    const lastLoggedInDate = new Date(lastLoggedIn as string)
    const currentDate = new Date()

    if (
      (currentDate.getTime() - lastLoggedInDate.getTime()) /
        1000 /
        60 /
        60 /
        24 >=
      30
    ) {
      await logout()
      router.push('/')
      return
    }

    const allUsers = snapshot.docs.map((doc) => doc.data())
    const currentUser = allUsers.find(
      (eachUser) => eachUser.userID === user.uid
    ) as ActiveUser

    boards.value = currentUser['boards']
    if (boards.value.length) {
      currentBoard.value = boards.value[0]
    }

    const savedBoard = JSON.parse(localStorage.getItem('currentBoard') || '{}')
    if (savedBoard) {
      currentBoard.value = savedBoard
    }

    isLoading.value = false
  } catch (err) {
    throw new Error()
  }
})

const areBoardOptionsShown = ref(false)
const boardsNavbarProps = computed(() => ({
  condition: windowWidth.value < 640 ? isNavOpen.value : isSidebarShown.value,
  width: windowWidth.value,
  theme: isDark.value,
  boards: boards.value,
  boardName: currentBoard.value ? currentBoard.value.name : ''
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
</style>

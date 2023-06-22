<template>
    <transition :name="width < 640 ? 'nav-mobile' : 'nav-desktop'">
        <nav
            v-show="condition"
            aria-label="boards navigation"
            class="py-4 bg-white dark:bg-gray-700"
            :class="{
                'mobile-boards': width < 640,
                'desktop-boards': width >= 640,
                'absolute sm:scale-0': width < 640,
                'scale-0 sm:scale-100': width >= 640
            }"
        >
            <div v-if="width >= 640" class="px-[10%] mt-4 mb-[54px]">
                <img
                    :src="theme ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
                    alt="app logo"
                    class="h-[26px] w-[153px]"
                >
            </div>
            <p class="all-boards">all boards ({{ boards.length }})</p>
            <div :class="{ 'flex flex-col justify-between grow': width >= 640 }">
                <ul>
                    <board-label
                        v-for="{ name } in boards"
                        :key="name"
                        :name="name"
                        :class="{
                            'bg-purple-400 fill-white text-white': name === boardName,
                            'text-gray-400 fill-gray-400': name !== boardName
                        }"
                    />
                    <board-label
                        @click="isAddBoardDialogShown = true"
                        name="Create New Board"
                        class="text-purple-400 fill-purple-400"
                    />
                </ul>
                <div>
                    <theme-toggle />
                    <board-label
                        v-show="width >= 640"
                        @click="toggleSidebar"
                        name="Hide Sidebar"
                        class="my-2 text-gray-400 fill-gray-400"
                    />
                </div>
            </div>
        </nav>
    </transition>
    <transition name="dialog">
        <board-dialog
            v-if="isAddBoardDialogShown"
            action="add"
            :closeDialog="() => isAddBoardDialogShown = false"
            :selectedMultiOptionItems="['Todo', 'Doing']"
        />
    </transition>
</template>

<script setup lang="ts">
import type { Board } from '../../api/boardsTypes'
import ThemeToggle from './ThemeToggle.vue'
import BoardLabel from './BoardLabel.vue'
import BoardDialog from '../Dialogs/BoardDialog.vue'
import { ref } from 'vue'

defineProps<{
    condition: boolean,
    width: number,
    theme: boolean,
    boards: Board[],
    boardName: Board['name'],
    toggleSidebar: () => void
}>()

const isAddBoardDialogShown = ref(false)
</script>

<style scoped>
.nav-mobile-enter-from,
.nav-mobile-leave-to {
    @apply origin-top opacity-50 scale-0;
}

.nav-desktop-enter-from,
.nav-desktop-leave-to {
    @apply -translate-x-full;
}

.nav-mobile-enter-active,
.nav-desktop-enter-active,
.nav-mobile-leave-active, 
.nav-desktop-leave-active {
    @apply transition-all duration-500;
}

.mobile-boards {
    @apply absolute top-[calc(12vh+1rem)] right-1/2 translate-x-1/2;
    @apply w-[70vw] rounded-lg shadow-sm;
}

.desktop-boards {
    @apply row-span-2 flex flex-col pt-4 rounded-none shadow-xs;
}

.all-boards {
    @apply ml-3 min-[350px]:ml-6 mb-[20px] text-xs text-gray-400;
    @apply uppercase tracking-[2.4px] font-normal;
}
</style>
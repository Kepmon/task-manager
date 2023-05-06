<template>
    <transition :name="width < 640 ? 'nav-mobile' : 'nav-desktop'">
        <nav
            v-show="condition"
            aria-label="boards navigation"
            class="py-4 bg-white dark:bg-dark-grey"
            :class="{
                'mobile-boards': width < 640, 'desktop-boards': width >= 640 
            }"
        >
            <div v-show="width >= 640" class="px-[10%] mt-4 mb-[54px]">
                <img
                    :src="theme ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
                    alt="app logo"
                    class="h-[26px] w-[153px]"
                >
            </div>

            <h3 class="boards-heading">all boards ({{ boards.length }})</h3>
            <div :class="{ 'flex flex-col justify-between grow': width >= 640 }">
                <div>
                    <board-label
                        v-for="{ name } in boards"
                        :key="name"
                        :name="name"
                        :class="{ 
                            'bg-main-purple fill-white': name === boardName, 'text-white': name === boardName, 
                            'text-medium-grey fill-medium-grey': name !== boardName
                        }"
                    />

                    <board-label
                        @click="addNewBoard"
                        name="Create New Board"
                        class="text-main-purple fill-main-purple"
                    />
                </div>

                <div>
                    <theme-toggle />
                    <board-label
                        v-show="width >= 640"
                        @click="toggleSidebar"
                        name="Hide Sidebar"
                        class="my-2 text-medium-grey fill-medium-grey"
                    />
                </div>  
            </div>
        </nav>
    </transition>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
import BoardLabel from './BoardLabel.vue'
import type { Board } from '../../api/boardsTypes'

defineProps<{
    condition: boolean,
    width: number,
    theme: boolean,
    boards: Board[],
    boardName: Board['name'],
    toggleSidebar: () => void,
    addNewBoard: () => void
}>()
</script>

<style scoped>
.nav-mobile-enter-from,
.nav-mobile-leave-to {
    @apply origin-top-right opacity-50 scale-0;
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
    @apply absolute top-[calc(12vh+1rem)] left-1/2 -translate-x-1/2;
    @apply w-[70vw] rounded-lg shadow-sm;
}

.desktop-boards {
    @apply row-span-2 flex flex-col pt-4 rounded-none shadow-xs;
}

.boards-heading {
    @apply ml-6 mb-[20px] text-sm text-medium-grey uppercase tracking-[2.4px] font-normal;
}

.boards-name {
    @apply whitespace-nowrap text-[14px] min-[350px]:text-base overflow-hidden;
}
</style>
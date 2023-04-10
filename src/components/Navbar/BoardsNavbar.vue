<template>
    <transition :name="width < 640 ? 'nav-mobile' : 'nav-desktop'">
        <nav
            aria-label="boards navigation"
            class="py-4 bg-white dark:bg-dark-grey"
            :class="{
                'mobile-boards': width < 640, 'desktop-boards': width >= 640 
            }"
        >
            <div v-show="width >= 640" class="px-[10%] mt-4 mb-[54px]">
                <img
                    v-show="theme"
                    src="/img/logo-light.svg"
                    alt="app logo"
                    class="h-[26px] w-[153px]"
                >
                <img
                    v-show="!theme"
                    src="/img/logo-dark.svg"
                    alt="app logo"
                    class="h-[26px] w-[153px]"
                >
            </div>

            <h3 class="boards-heading">all boards (3)</h3>
            <div :class="{ 'flex flex-col justify-between grow': width >= 640 }">
                <div>
                    <div
                        v-for="{ name, isActive } in boards"
                        :key="name"
                        class="flex items-center h-12 w-[90%] pl-6 pr-6 rounded-r-[100px] sm:pr-11 sm:w-[max-content]"
                        :class="{ 
                            'bg-main-purple': isActive, 'text-white': isActive, 
                            'text-medium-grey': !isActive
                        }">
                        <img
                            :src="isActive ? '/img/icon-board-white.svg' : '/img/icon-board.svg'"
                            alt="board icon"
                            class="mr-3"
                        >
                        <span class="boards-name">{{ name }}</span>
                    </div>
                    
                    <div class="flex items-center px-6 h-12 w-[90%] text-main-purple">
                        <img
                            src="/img/icon-board-purple.svg"
                            alt="board icon"
                            class="mr-3"
                        >
                        <img
                            src="/img/icon-add-purple.svg"
                            alt="board icon"
                            class="mr-1 h-[10px]"
                        >
                        <span class="whitespace-nowrap text-[14px] min-[350px]:text-base overflow-hidden">
                            Create New Board
                        </span>
                    </div>
                </div>

                <div>
                    <theme-toggle />
                    <div
                        v-show="width >= 640"
                        @click="callback"
                        class="flex items-center gap-x-[10px] pt-4 pb-3 px-4 mt-2 cursor-pointer"
                    >
                        <img src="/img/icon-hide-sidebar.svg" alt="hide sidebar">
                        <span class="text-medium-grey">Hide Sidebar</span>
                    </div>
                </div>  
            </div>
        </nav>
    </transition>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue';
import { ref } from 'vue'

defineProps<{
    width: number,
    theme: boolean,
    callback?: () => void
}>()

const boards = ref([
    {
        name: 'Platform Launch',
        isActive: true
    },
    {
        name: 'Marketing Plan',
        isActive: false
    },
    {
        name: 'Roadmap',
        isActive: false
    }
])
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
    @apply flex flex-col pt-4 w-1/3 rounded-none shadow-xs;
    @apply min-[896px]:w-1/4 xl:w-1/5;
}

.boards-heading {
    @apply ml-6 mb-[20px] text-sm text-medium-grey uppercase tracking-[2.4px] font-normal;
}

.boards-name {
    @apply whitespace-nowrap text-[14px] min-[350px]:text-base overflow-hidden;
}
</style>
<template>
    <nav aria-label="main navigation" class="main-nav">
        <div class="flex gap-2 items-center h-full">
            <img
                src="/img/logo-mobile.svg"
                alt="app logo"
                class="sm:hidden h-5 min-[350px]:h-auto"
            >
            <div v-show="isLogo && width >= 640" class="main-nav__logo">
                <img
                    :src="theme ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
                    alt="app logo"
                    class="h-[26px] w-[153px] pr-6"
                >
            </div>
            <div @click="toggleBoardsNav" class="flex items-center gap-2">
                <h2
                    class="font-bold min-[330px]:text-lg"
                    :class="{ 'pl-6': isLogo && width >= 640 }"
                >
                    {{ boardName }}
                </h2>
                <svg
                    v-show="width < 640"
                    width="10"
                    height="7"
                    xmlns="http://www.w3.org/2000/svg"
                    class="transition-transform duration-500"
                    :class="{ 'rotate-180': navOpen }"
                >
                    <path stroke="#635FC7" stroke-width="2" fill="none" d="m1 1 4 4 4-4"/>
                </svg>
            </div>
        </div>

        <div class="flex items-center gap-3 min-[350px]:gap-4 relative">
            <more-options
                :condition="areOptionsShown"
                element="Board"
                :editTask="editTask"
                :editBoard="editBoard"
                :deleteTask="deleteTask"
                :deleteBoard="deleteBoard"
                :toggleOptions="toggleOptions"
                :closeOptions="closeOptions"
                class="top-12 right-0"
            />
            <the-button
                @click.prevent="addTask"
                :regularButton="true"
                class="gap-[2px] bg-main-purple hover:bg-main-purple-hover transition-all duration-300" 
                :class="{
                    'opacity-25 cursor-not-allowed': dashboard,
                    'cursor-pointer': !dashboard
                }"
            >
                <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" class="scale-[.7]">
                    <path fill="#FFF" d="M7.368 12V7.344H12V4.632H7.368V0H4.656v4.632H0v2.712h4.656V12z"/>
                </svg>
                <span v-show="width >= 640" class="text-white">Add New Task</span>
            </the-button>
            <img
                @click="toggleOptions"
                src="/img/icon-vertical-ellipsis.svg"
                alt="click here to see more options"
                data-ellipsis
                class="px-1 h-[18px] cursor-pointer min-[350px]:h-auto"
            >
        </div>
    </nav>
</template>

<script setup lang="ts">
import TheButton from '../shared/TheButton.vue'
import MoreOptions from '../shared/MoreOptions.vue'

defineProps<{
    sidebar: boolean,
    isLogo: boolean,
    theme: boolean,
    dashboard: boolean,
    width: number,
    boardName: string,
    areOptionsShown: boolean,
    navOpen: boolean,
    toggleOptions: (e: Event) => void,
    closeOptions: (e: Event) => void,
    toggleBoardsNav: () => void,
    addTask: () => void,
    editTask: () => void,
    editBoard: () => void,
    deleteTask: () => void,
    deleteBoard: () => void
}>()
</script>

<style scoped>
.main-nav {
    @apply flex items-center justify-between basis-full px-3;
    @apply min-[350px]:px-6 shadow-xs bg-white dark:bg-dark-grey;
}

.main-nav__logo {
    @apply flex items-center h-full sm:border-r;
    @apply sm:border-lines-light dark:border-lines-dark;
}

.main-nav__button {
    @apply flex gap-2 items-center bg-main-purple rounded-3xl px-3 py-[6px];
    @apply min-[330px]:px-6 min-[330px]:py-[10px];
}
</style>
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
                <div class="flex items-center gap-2">
                    <h2
                        class="font-bold min-[330px]:text-lg"
                        :class="{ 'pl-6': isLogo && width >= 640 }"
                    >
                        Platform Launch
                    </h2>
                    <img src="/img/icon-chevron-down.svg" alt="click here to see more options">
                </div>
            </div>

            <div class="flex items-center gap-3 min-[350px]:gap-4">
                <the-button
                    @click="callback"
                    :default-class="true" 
                    :class="{
                        'opacity-25 cursor-not-allowed': dashboard,
                        'cursor-pointer': !dashboard
                    }">
                    <img src="/img/icon-add-task-mobile.svg" alt="" class="h-3">
                    <span v-show="width >= 640" class="text-white">Add New Column</span>
                </the-button>
                <img
                    src="/img/icon-vertical-ellipsis.svg"
                    alt="click here to see more options"
                    class="h-[18px] min-[350px]:h-auto"
                >
            </div>
        </nav>
</template>

<script setup lang="ts">
import TheButton from '../shared/TheButton.vue';

defineProps<{
    sidebar: boolean,
    isLogo: boolean,
    theme: boolean,
    dashboard: boolean,
    width: number,
    callback: () => void
}>()
</script>

<style scoped>
.main-nav {
    @apply flex items-center justify-between basis-full px-3;
    @apply min-[350px]:px-6 shadow-xs bg-white dark:bg-dark-grey sm:h-[12vh];
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
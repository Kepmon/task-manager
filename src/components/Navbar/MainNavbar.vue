<template>
        <nav aria-label="main navigation" class="main-nav">
            <div class="flex gap-2 items-center h-full">
                <img
                    src="/img/logo-mobile.svg"
                    alt="app logo"
                    class="sm:hidden h-5 min-[350px]:h-auto"
                >
                <div v-show="isLogo" class="main-nav__logo">
                    <img
                        :src="theme ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
                        alt="app logo"
                        class="hidden sm:block h-[26px] w-[153px] pr-6"
                    >
                </div>
                <div class="flex items-center gap-2">
                    <h2
                        class="font-bold min-[330px]:text-lg"
                        :class="{ 'pl-6': !sidebar }">Platform Launch
                    </h2>
                    <img src="/img/icon-chevron-down.svg" alt="click here to see more options">
                </div>
            </div>

            <div class="flex items-center gap-3 min-[350px]:gap-4">
                <button
                    @click="callback"
                    class="main-nav__button"
                    :class="{
                        'opacity-25 cursor-not-allowed': dashboard,
                        'cursor-pointer': !dashboard
                    }"
                >
                    <img
                        src="/img/icon-add-task-mobile.svg"
                        alt="add new task"
                        class="sm:h-3"
                    >
                    <span class="hidden sm:inline text-white">Add New Task</span>
                </button>
                <img
                    src="/img/icon-vertical-ellipsis.svg"
                    alt="click here to see more options"
                    class="h-[18px] min-[350px]:h-auto"
                >
            </div>
        </nav>
</template>

<script setup lang="ts">
defineProps<{
    sidebar: boolean,
    isLogo: boolean,
    theme: boolean,
    dashboard: boolean,
    callback: () => void
}>()
</script>

<style scoped>
.main-nav {
    @apply flex items-center justify-between basis-full h-[max(12vh,12vw)] px-3;
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
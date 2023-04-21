<template>
    <div class="flex items-center justify-center gap-x-6 mt-4 mx-auto h-12 w-[90%] rounded-md bg-light-grey dark:bg-very-dark-grey">
        <img src="/img/icon-light-theme.svg" alt="">
        <the-button
            @click="toggleDark()"
            :regularButton="false"
            background="purple"
            class="flex items-center px-1 w-[40px] h-[20px] rounded-xl"
        >
            <transition-group name="theme-toggle">
                <div class="w-[14px] h-[14px] bg-white rounded-full" :class="{ 'ml-auto': isDark }" key="theme-toggle"></div>
            </transition-group>
        </the-button>
        <img src="/img/icon-dark-theme.svg" alt="choose dark theme">
    </div>
</template>

<script setup lang="ts">
import TheButton from '../shared/TheButton.vue';
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<style scoped>
.theme-toggle-move {
    @apply transition-all duration-300;
}
</style>
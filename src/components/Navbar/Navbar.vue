<template>
    <div class="flex h-screen overflow-hidden">
        <boards-navbar
            v-show="isNavOpen"
            :width="width"
            :theme="isDark"
            class="absolute sm:scale-0"
        />
        <boards-navbar
            v-show="isSidebarShown"
            :width="width"
            :theme="isDark"
            :callback="toggleSidebar"
            class="scale-0 sm:scale-100"
        />
        <main-navbar
            :sidebar="isSidebarShown"
            :isLogo="isLogoShown"
            :theme="isDark"
            :dashboard="isDashboardEmpty"
            :width="width"
            :callback="toggleMobileSubnav"
        />
        
        <div
            @click="toggleSidebar"
            v-show="isLogoShown && width >= 640"
            class="show-sidebar">
            <img src="/img/icon-show-sidebar.svg" alt="show sidebar">
        </div>
    </div>
</template>

<script setup lang="ts">
import MainNavbar from './MainNavbar.vue'
import BoardsNavbar from './BoardsNavbar.vue'
import { ref } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark()

const isNavOpen = ref(false)
const isDashboardEmpty = ref(false)
const toggleMobileSubnav = () => {
    if (!isDashboardEmpty.value) {
        isNavOpen.value = !isNavOpen.value
    }
}

const isSidebarShown = ref(true)
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

const width = ref(window.innerWidth)
const resizeObserwer = new ResizeObserver((entries) => {
    width.value = entries[0].contentRect.width
})
resizeObserwer.observe(document.body)
</script>

<style scoped>
.show-sidebar {
    @apply flex items-center justify-center absolute left-0 bottom-6;
    @apply h-12 w-14 rounded-r-[100px] bg-main-purple cursor-pointer;
}
</style>
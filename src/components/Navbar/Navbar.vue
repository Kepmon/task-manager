<template>
    <div key="nav-container" class="flex h-screen overflow-hidden">
        <boards-navbar
            v-show="width < 640 && isNavOpen"
            :width="width"
            :theme="isDark"
        />
        <boards-navbar
            v-show="width >= 640 && isSidebarShown"
            :width="width"
            :theme="isDark"
            :callback="toggleSidebar"
        />
        <main-navbar
            :sidebar="isSidebarShown"
            :isLogo="isLogoShown"
            :theme="isDark"
            :dashboard="isDashboardEmpty"
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
import { ref, computed } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark()

const isNavOpen = ref(false)
const isDashboardEmpty = ref(true)
const toggleMobileSubnav = () => {
    if (!isDashboardEmpty.value) {
        isNavOpen.value = !isNavOpen.value
    }
}

const isSidebarShown = ref(true)
const isLogoShown = ref(false)
const time = computed(() => !isSidebarShown.value ? 500 : 0)
const toggleSidebar = () => {
    isSidebarShown.value = !isSidebarShown.value
    setTimeout(() => {
        isLogoShown.value = !isLogoShown.value
    }, time.value)
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
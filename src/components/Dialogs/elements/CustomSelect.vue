<template>
    <div
        class="relative" 
        role="combobox"
        :aria-expanded="isDropdownShown ? true : false"
    >
        <button
            @click.enter.prevent="isDropdownShown = !isDropdownShown"
            aria-controls="dropdown"
            tabindex="0"
            class="select-btn"
        >
            {{ currentStatus }}
            <svg
                width="10"
                height="7"
                xmlns="http://www.w3.org/2000/svg"
                class="transition-transform duration-500"
                :class="{ 'rotate-180': isDropdownShown }"
            >
                <path stroke="#635FC7" stroke-width="2" fill="none" d="m1 1 4 4 4-4"/>
            </svg>
        </button>
        <transition name="dropdown">
            <div
                v-show="isDropdownShown"
                id="dropdown"
                class="absolute w-full p-4 bg-white dark:bg-very-dark-grey rounded-lg"
            >
                <div class="flex flex-col gap-2">
                    <label
                        @click="($event) => changeCurrentStatus($event)"
                        @keyup.enter="($event) => changeCurrentStatus($event)"
                        v-for="{ name } in columns"
                        :key="name"
                        role="option"
                        tabindex="0"
                        class="text-sm text-medium-grey cursor-pointer"
                    >
                        <input type="radio" :name="name" class="appearance-none">
                        {{ name }}
                    </label>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import type { BoardColumn } from '../../api/boardsTypes'
import { ref } from 'vue'

const props = defineProps<{
    selectedStatus?: string,
    columns?: BoardColumn[]
}>()

const isDropdownShown = ref(false)
const currentStatus = ref(props.selectedStatus)
const changeCurrentStatus = (e: Event) => {
    const label = e.target as HTMLLabelElement
    const radio = label.querySelector('input') as HTMLInputElement
    currentStatus.value = radio.name
    isDropdownShown.value = false
}
</script>

<style scoped>
.select-btn {
    @apply flex items-center justify-between gap-2 py-2 px-4 w-full text-sm;
    @apply bg-white dark:bg-dark-grey shadow-option rounded-[4px] cursor-pointer;
    @apply appearance-none focus:outline focus:outline-main-purple;
}

.dropdown-enter-from,
.dropdown-leave-to {
    @apply opacity-0 -translate-y-4;
}

.dropdown-enter-active,
.dropdown-leave-active {
    @apply transition-all duration-500;
}
</style>
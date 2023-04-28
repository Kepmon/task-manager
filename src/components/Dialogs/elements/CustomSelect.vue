<template>
<div
    class="select-container" 
    role="combobox"
    :aria-expanded="isDropdownShown ? true : false"
>
    <button @click.prevent="isDropdownShown = !isDropdownShown" class="select-btn">
        {{ currentStatus }}
    </button>
    <transition name="dropdown">
        <div
            v-show="isDropdownShown"
            class="absolute p-4 w-full bg-white dark:bg-very-dark-grey rounded-lg"
        >
            <div class="flex flex-col gap-2" role="option">
                <label
                    @click="changeCurrentStatus($event)"
                    v-for="{ name } in columns"
                    :key="name"
                    class="text-s text-medium-grey cursor-pointer"
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
.select-container {
    @apply relative after:content-down-arrow;
    @apply after:absolute after:right-4 after:top-1 after:h-[max-content];
}

.select-btn {
    @apply py-2 px-4 w-full text-s bg-white dark:bg-dark-grey shadow-option rounded-[4px];
    @apply text-left cursor-pointer appearance-none focus:outline focus:outline-main-purple;
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
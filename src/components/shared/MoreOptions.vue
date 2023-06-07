<template>
    <transition name="options">
        <div
            ref="target"
            @click="toggleOptions"
            v-if="condition"
            class="options-container"
            :class="{
                'right-6 top-[72px]': element === 'board',
                'right-0 -top-4': element === 'task'
            }"
        >
            <p
                @click="showEditForm"
                class="mb-4 text-sm text-medium-grey cursor-pointer"
            >
                Edit {{ element }}
            </p>
            <p 
                @click="showDeleteForm"
                class="text-sm text-regular-red cursor-pointer"
            >
                Delete {{ element }}
            </p>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

const props = defineProps<{
    condition: boolean,
    element: 'task' | 'board',
    showEditForm: () => void,
    showDeleteForm: () => void,
    toggleOptions: (e: Event) => void,
    closeMoreOptions: (e: Event) => void
}>()

const target = ref(null)
onClickOutside(target, props.closeMoreOptions)
</script>

<style scoped>
.options-container {
    @apply absolute p-4 w-[150px] md:w-[192px] rounded-lg shadow-xs;
    @apply bg-white dark:bg-very-dark-grey;
}

.options-enter-from,
.options-leave-to {
    @apply opacity-0 scale-0 origin-top-right sm:origin-top;
}

.options-enter-active,
.options-leave-active {
    @apply transition-all duration-500;
}
</style>
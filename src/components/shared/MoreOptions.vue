<template>
    <transition name="options">
        <div v-if="condition" class="options-container">
            <p
                @click="element === 'Task' ? editTask() : editBoard()"
                class="mb-4 text-s text-medium-grey cursor-pointer"
            >
                Edit {{ element }}
            </p>
            <p 
                @click="element === 'Task' ? deleteTask() : deleteBoard()"
                class="text-s text-regular-red cursor-pointer"
            >
                Delete {{ element }}
            </p>
        </div>
    </transition>
</template>

<script setup lang="ts">
defineProps<{
    condition: boolean,
    element: 'Task' | 'Board',
    editTask: () => void,
    editBoard: () => void,
    deleteTask: () => void,
    deleteBoard: () => void
}>()
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
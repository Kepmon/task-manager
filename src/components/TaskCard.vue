<template>
    <div
        @click="showTaskDetails"
        class="task-card group"
    >
        <p class="mb-1 group-hover:text-purple-400 transition-all duration-300">
            {{ title }}
        </p>
        <p class="text-gray-400 text-xs">
            {{ howManyCompleted }} of {{ howManySubtasks }} subtasks
        </p>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string,
    howManyCompleted: number,
    howManySubtasks: number,
    showTaskDetails: (e: Event) => void
}>()
</script>

<style scoped>
.task-card {
    @apply p-4 mb-[20px] w-[280px] text-left shadow-sm cursor-pointer rounded-lg;
    @apply bg-white dark:bg-gray-700;
}
</style>
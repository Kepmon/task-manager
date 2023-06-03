<template>
<div
    @click="callback"
    class="task-card group"
>
    <p class="mb-1 group-hover:text-main-purple transition-all duration-300">
        {{ title }}
    </p>
    <p class="text-medium-grey text-xs">
        {{ howManyCompleted }} of {{ howManySubtasks }} subtasks
    </p>
</div>
</template>

<script setup lang="ts">
defineProps<{
    title: string,
    howManyCompleted: number,
    howManySubtasks: number,
    callback: () => void
}>()
</script>

<style scoped>
.task-card {
    @apply p-4 mb-[20px] w-[280px] text-left shadow-sm cursor-pointer rounded-lg;
    @apply bg-white dark:bg-dark-grey;
}
</style>
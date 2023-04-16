<template>
<div
    @click="callback"
    class="bg-white dark:bg-dark-grey rounded-lg w-[280px] mb-[20px] text-left shadow-sm p-4"
>
    <p class="mb-1">{{ title }}</p>
    <p class="text-medium-grey text-sm">
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
<template>
<div
    class="columns-container"
    :class="{ 'columns-container--sizes': !logo }"
>
    <div class="flex gap-6 h-max">
        <div v-for="column in columns" :key="column.name" class="flex flex-col">
            <div class="flex items-center gap-2 mb-8">
                <div class="h-[15px] w-[15px] rounded-full" :class="circleColor(column)"></div>
                <p class="text-sm text-medium-grey uppercase" >{{ column.name }} ({{ column.tasks.length }})</p>
            </div>
            <task-card
                v-for="{ title, subtasks } in column.tasks"
                :key="title"
                :howManyCompleted="returnNumberOfCompletedSubtasks(subtasks)"
                :howManySubtasks="subtasks.length"
                :title="title"
                :callback="callback"
            />
        </div>
        <div class="new-column group">
            <div class="flex gap-2 items-center justify-center text-medium-grey p-2">
                <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="#828FA3"
                        d="M7.368 12V7.344H12V4.632H7.368V0H4.656v4.632H0v2.712h4.656V12z"
                        class="group-hover:fill-main-purple transition-all duration-300"
                    />
                </svg>
                <span class="text-xl group-hover:text-main-purple transition-all duration-300">
                    New Column
                </span>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import type { BoardColumn } from '../api/boardsTypes'
import TaskCard from './TaskCard.vue'
import { returnNumberOfCompletedSubtasks } from '../composables/completedTasks'
import { computed } from 'vue'

const props = defineProps<{
    columns: BoardColumn[],
    logo: boolean,
    callback: () => void
}>()

const circleColor = computed(() => {
    return (column: BoardColumn) => ({
        'bg-first-column': props.columns.indexOf(column) % 3 === 0,
        'bg-second-column': props.columns.indexOf(column) % 3 === 1,
        'bg-third-column': props.columns.indexOf(column) % 3 === 2
    })
})
</script>

<style scoped>
.columns-container {
    @apply h-full overflow-scroll;
    @apply scrollbar-invisible hover:scrollbar-visibleLight dark:hover:scrollbar-visibleDark;
}

.columns-container--sizes {
    @apply w-[calc(100vw-32px)] sm:w-[calc(67vw-48px)];
    @apply min-[896px]:w-[calc(75vw-48px)] xl:w-[calc(80vw-48px)];
}

.new-column {
    @apply flex items-center justify-center mt-[44px]  min-w-[280px] shadow-column;
    @apply bg-gradient-to-b from-light-column-start to-light-column-end cursor-pointer;
    @apply dark:from-dark-column-start dark:to-dark-column-end;
}
</style>
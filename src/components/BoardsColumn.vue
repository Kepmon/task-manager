<template>
<div class="columns-container">
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
        />
    </div>
    <div class="new-column">    
        <div class="flex gap-2 items-center justify-center h-full text-medium-grey shadow-column">
            <img src="/img/icon-add-gray.svg" alt="">
            <span class="text-xl">New Column</span>
        </div>        
    </div>
</div>
</template>

<script setup lang="ts">
import type { BoardColumn } from '../api/boardsTypes'
import type { Subtask } from '../api/boardsTypes'
import TaskCard from './TaskCard.vue'
import { computed } from 'vue'

const props = defineProps<{
    columns: BoardColumn[]
}>()

const circleColor = computed(() => {
    return (column: BoardColumn) => ({
        'bg-first-column': props.columns.indexOf(column) % 3 === 0,
        'bg-second-column': props.columns.indexOf(column) % 3 === 1,
        'bg-third-column': props.columns.indexOf(column) % 3 === 2
    })
})

const returnNumberOfCompletedSubtasks = (arr: Subtask[]) =>
arr.filter((subtask) => subtask.isCompleted === true).length
</script>

<style scoped>
.columns-container {
    @apply flex gap-6 w-[calc(100vw-32px)] overflow-scroll;
    @apply scrollbar-invisible hover:scrollbar-visibleLight dark:hover:scrollbar-visibleDark;
    @apply sm:w-[calc(67vw-48px)] min-[896px]:w-[calc(75vw-48px)] xl:w-[calc(80vw-48px)];
}

.new-column {
    @apply mt-[44px] w-[280px] bg-gradient-to-b from-light-column-start to-light-column-end;
    @apply dark:from-dark-column-start dark:to-dark-column-end;
}
</style>
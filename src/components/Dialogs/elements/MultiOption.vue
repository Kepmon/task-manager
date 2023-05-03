<template>
    <div>
        <p class="mb-2 text-sm">
            {{ modifiedItem === 'Task' ? 'Subtasks' : 'Board Columns' }}
        </p>

        <div
            v-for="item in selectedMultiOptionItems"
            class="flex items-center gap-2 [&:not(:last-of-type)]:mb-[6px]"
        >
            <input
                type="text"
                class="input"
                :placeholder="
                    modifiedItem === 'Task' && formType === 'Add' ? item : undefined
                "
                :value="
                    modifiedItem === 'Task' && formType === 'Add' ? undefined : item
                "
                >
            <img
                src="/img/icon-cross.svg"
                :alt="`remove this ${modifiedItem === 'Task' ? 'subtask' : 'column'}`"
                class="p-2 cursor-pointer"
            >
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Subtask, BoardColumn } from '../../../api/boardsTypes'
import { returnBoardProperties } from '../../../composables/boardProperties'
import { computed } from 'vue'

const props = defineProps<{
    modifiedItem: 'Task' | 'Board',
    formType: 'SeeTask' | 'Add' | 'Edit' | 'Delete',
    isDark: boolean
}>()

interface MultiOptionItems {
    AddTask: string[]
    EditTask: Subtask['title']
    AddBoard: string[]
    EditBoard: BoardColumn['name']
}

const boardProperties = returnBoardProperties()
const subtasksTitles = boardProperties.subtasks.map(subtask => subtask.title)
const boardColumns = boardProperties.columns.map(column => column.name)

const multiOptionItems = {
    AddTask: [
        'e.g. Make coffee',
        'e.g. Drink coffee & smile'
    ],
    EditTask: subtasksTitles,
    AddBoard: [
        'Todo',
        'Doing'
    ],
    EditBoard: boardColumns
}
    
const selectedMultiOptionItems = computed(() => 
    multiOptionItems[props.formType+props.modifiedItem as keyof MultiOptionItems])
</script>

<style scoped>
.input {
    @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-s font-normal;
    @apply outline-none border border-input-border focus:border-input-border-focus;
}
</style>
<template>
    <div>
        <p class="mb-2 text-sm">
            {{ modifiedItem === 'Task' ? 'Subtasks' : 'Board Columns' }}
        </p>

        <div class="flex flex-col gap-3">
            <div
                v-for="item in selectedMultiOptionItems"
                class="flex items-center gap-2"
            >
                <input-text
                    :placeholder="
                        modifiedItem === 'Task' && formType === 'Add' ? item : undefined
                    "
                    :inputValue="
                        modifiedItem === 'Task' && formType === 'Add' ? undefined : item
                    "
                    :formType="formType"
                    type="input"
                    :error="isError"
                    :class="{ 'after:content-none': !isError }"
                    class="grow relative after:content-['Can\'t_be_empty'] after:text-s after:text-regular-red after:font-normal after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2"
                />
                <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                    <g :fill="isError ? '#EA5555' : '#828FA3'">
                        <path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/>
                        <path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/>
                    </g>
                </svg>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Subtask, BoardColumn } from '../../../api/boardsTypes'
import InputText from './InputText.vue'
import { returnBoardProperties } from '../../../composables/boardProperties'
import { ref, computed } from 'vue'

const props = defineProps<{
    modifiedItem: 'Task' | 'Board',
    formType: 'SeeTask' | 'Add' | 'Edit' | 'Delete',
    isDark: boolean
}>()

const isError = ref(false)

interface MultiOptionItems {
    AddTask: string[]
    EditTask: Subtask['title'][]
    AddBoard: string[]
    EditBoard: BoardColumn['name'][]
}

const boardProperties = returnBoardProperties()
const subtasksTitles = boardProperties.subtasks.map(subtask => subtask.title)
const boardColumns = boardProperties.columns.map(column => column.name)

const multiOptionItems: MultiOptionItems = {
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
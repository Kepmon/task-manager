<template>
    <div>
        <p class="mb-2 text-xs">
            {{ modifiedItem === 'task' ? 'Subtasks' : 'Board Columns' }}
        </p>

        <div class="flex flex-col gap-3">
            <div
                v-for="item in selectedMultiOptionItems"
                class="flex items-center gap-2"
            >
                <input-text
                    :placeholder="
                        modifiedItem === 'task' && formType === 'add' ? item : undefined
                    "
                    :inputValue="
                        modifiedItem === 'task' && formType === 'add' ? undefined : item
                    "
                    :formType="formType"
                    type="text"
                    :error="isError"
                    :class="{ 'after:content-none': !isError }"
                    class="subtask-input"
                />
                <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" class="cursor-pointer">
                    <g :class="{ 'fill-red-400': isError, 'fill-gray-400': !isError }">
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
import InputText from '../../shared/InputText.vue'
import { ref } from 'vue'

defineProps<{
    modifiedItem: 'task' | 'board',
    formType: 'add' | 'edit',
    selectedMultiOptionItems: Subtask['title'][] | BoardColumn['name'][] | string[]
}>()

const isError = ref(false)
</script>

<style>
.subtask-input {
    @apply grow relative after:content-['Can\'t_be_empty'] after:text-sm;
    @apply after:text-red-400 after:font-normal after:absolute;
    @apply after:right-4 after:top-1/2 after:-translate-y-1/2;
}
</style>
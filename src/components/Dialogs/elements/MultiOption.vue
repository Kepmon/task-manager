<template>
    <div>
        <p class="mb-2 text-sm">{{ title }}</p>

        <div
            v-for="item in items"
            class="flex items-center gap-2 [&:not(:last-of-type)]:mb-[6px]"
        >
            <input
                type="text"
                class="input"
                :placeholder="typeof(item) === 'string' ? item : ''"
            >
            <img src="/img/icon-cross.svg" :alt="`remove this ${element}`" class="p-2 cursor-pointer">
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Subtask, BoardColumn } from '../../../api/boardsTypes'

defineProps<{
    title: 'Subtasks' | 'Board Columns',
    element: 'subtask' | 'column',
    items: string[] | Subtask[] | BoardColumn[],
    isDark: boolean
}>()
</script>

<style scoped>
.input {
    @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-s font-normal;
    @apply outline-none border border-input-border focus:border-input-border-focus;
}
</style>
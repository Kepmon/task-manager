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

    <the-button
        :regularButton="true"
        :background="isDark ? 'white' : 'whitePurple'"
        class="justify-center mt-3 h-10 w-full"
    >
        <img src="/img/icon-add-purple.svg" alt="" class="h-2">
        <span class="text-main-purple text-s">
            Add New {{ element.slice(0, 1).toUpperCase()+element.slice(1) }}
        </span>
    </the-button>
</div>
</template>

<script setup lang="ts">
import type { Subtask, BoardColumn } from '../../../api/boardsTypes'
import TheButton from '../../shared/TheButton.vue'

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
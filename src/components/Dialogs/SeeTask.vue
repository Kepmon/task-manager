<template>
    <div class="flex flex-col gap-6">
        <p class="text-medium-grey text-sm min-[350px]:text-s">
            {{ description }}
        </p>
        <div>
            <p class="mb-4 text-sm text-medium-grey dark:text-white">
                Subtasks ({{ howManyCompleted }} of {{ howManySubtasks }})
            </p>
            <div
                v-for="subtask in subtasks"
                :key="subtask.title"
                class="[&:not(:last-of-type)]:mb-2 p-2 rounded"
                :class="{
                    'bg-light-grey dark:bg-very-dark-grey': subtask.isCompleted,
                    'bg-semitransparent-purple': !subtask.isCompleted
                }"
            >
                <label class="flex items-center gap-4 px-1 cursor-pointer">
                    <input type="checkbox" :checked="subtask.isCompleted" class="checkbox">
                    <span
                        class="text-sm"
                        :class="{ 'line-through opacity-50': subtask.isCompleted }"
                    >
                        {{ subtask.title }}
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Subtask } from '../../api/boardsTypes'

defineProps<{
    description: string,
    howManyCompleted: number,
    howManySubtasks: number,
    subtasks: Subtask[]
}>()
</script>

<style scoped>
.checkbox {
    @apply appearance-none after:flex after:items-center after:justify-center;
    @apply after:h-3 after:w-3 after:bg-white after:shadow-option after:rounded-[2px];
    @apply checked:after:bg-main-purple checked:after:content-checked;
}
</style>
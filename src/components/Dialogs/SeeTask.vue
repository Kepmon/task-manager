<template>
<dialog-backdrop>
    <dialog-form :options="true" :condition="areOptionsShown">
        <template v-slot:mainContent>
            <div class="flex items-center justify-between gap-4">
                <p class="min-[350px]:text-lg">{{ title }}</p>
                <img
                    @click="areOptionsShown = !areOptionsShown"
                    src="/img/icon-vertical-ellipsis.svg"
                    alt="click here to see more options"
                    class="px-2 cursor-pointer"
                >
            </div>
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
        </template>
        
        <template v-slot:select>
            <p class="mb-2 mt-6 text-sm text-medium-grey dark:text-white">
                Current Status
            </p>
            <custom-select :columns="columns" :status="status" />
        </template>
    </dialog-form>
</dialog-backdrop>
</template>

<script setup lang="ts">
import type { BoardColumn, Subtask } from '../../api/boardsTypes'
import DialogBackdrop from './elements/DialogBackdrop.vue'
import DialogForm from './elements/DialogForm.vue'
import CustomSelect from '../Dialogs/elements/CustomSelect.vue'
import { ref } from 'vue'

defineProps<{
    title: string,
    description: string,
    howManyCompleted: number,
    howManySubtasks: number,
    subtasks: Subtask[],
    columns: BoardColumn[],
    status: string
}>()

const areOptionsShown = ref(false)
</script>

<style scoped>
form {
    @apply relative p-6 sm:w-[480px] rounded-md bg-white dark:bg-dark-grey;
}

.form-content {
    @apply flex flex-col gap-6 max-h-[85vh] overflow-y-scroll scrollbar-invisible;
}

.checkbox {
    @apply appearance-none after:flex after:items-center after:justify-center;
    @apply after:h-3 after:w-3 after:bg-white after:shadow-option after:rounded-[2px];
    @apply checked:after:bg-main-purple checked:after:content-checked;
}
</style>
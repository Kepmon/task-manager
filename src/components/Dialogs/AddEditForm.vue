<template>
<div class="semitransparent-bg">
    <form class="form">
        <div class="form-content">
            <p class="min-[350px]:text-lg">{{ title }}</p>

            <input-text
                :label="inputOptions.taskTitle.label"
                :placeholder="inputOptions.taskTitle.placeholder"
                action="add"
                type="input"
            />
            <input-text
                :label="inputOptions.taskDescription.label"
                :placeholder="inputOptions.taskDescription.placeholder"
                action="add"
                type="textarea"
            />

            <multi-option
                title="Subtasks"
                element="subtask"
                :items="inputOptions.exemplarySubtasksPlaceholders"
                :isDark="isDark"
            />

            <div>
                <p class="mb-2 text-sm text-medium-grey dark:text-white">
                    Status
                </p>
                <custom-select status="Todo" :columns="columns" />
            </div>
            
            <the-button
                :regularButton="true"
                background="purple"
                class="text-s">
                {{ text }}
            </the-button>
        </div>
    </form>
</div>
</template>

<script setup lang="ts">
import type { BoardColumn } from '../../api/boardsTypes'
import InputText from './elements/InputText.vue'
import MultiOption from './elements/MultiOption.vue'
import TheButton from '../shared/TheButton.vue'
import CustomSelect from '../Dialogs/elements/CustomSelect.vue'

defineProps<{
    title: 'Add New Task' | 'Edit Task' | 'Add New Board' | 'Edit Board',
    isDark: boolean,
    columns: BoardColumn[],
    text: string
}>()

const inputOptions = {
    taskTitle: {
        label: 'Title',
        placeholder: 'e.g. Take coffee brake'
    },
    taskDescription: {
        label: 'Description',
        placeholder: 'e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little.'
    },
    exemplarySubtasksPlaceholders: [
        'e.g. Make coffee',
        'e.g. Drink coffee & smile'
    ]
}
</script>

<style scoped>
.semitransparent-bg {
    @apply flex items-center justify-center absolute p-4 inset-0 bg-semitransparent-black;
}

.form {
    @apply relative p-6 w-[90%] sm:w-[480px] rounded-md bg-white dark:bg-dark-grey;
}

.form-content {
    @apply flex flex-col gap-6 max-h-[85vh] overflow-y-scroll scrollbar-invisible;
}
</style>
<template>
    <div class="flex flex-col gap-6">
        <input-text
            :label="inputOptions.taskTitle.label"
            :placeholder="inputOptions.taskTitle.placeholder"
            action="add"
            type="input"
        />
        <input-text
            v-show="modifiedItem === 'Task'"
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
    </div>
</template>

<script setup lang="ts">
import InputText from './elements/InputText.vue'
import MultiOption from './elements/MultiOption.vue'

defineProps<{
    isDark: boolean,
    modifiedItem: 'Task' | 'Board'
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
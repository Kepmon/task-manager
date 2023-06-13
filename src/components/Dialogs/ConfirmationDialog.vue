<template>
    <dialogs-template
        :closeDialog="closeDialog"
    >
        <template v-slot:form-title>
            <h2 class="text-red-400">Delete this {{ elementToDelete }}?</h2>
        </template>

        <template v-slot:main-content>
            <p class="text-sm text-gray-400 font-normal">
                {{ message }}
            </p>

            <div
                class="flex flex-col min-[512px]:flex-row gap-4"
            >
                <the-button
                    :regularButton="true"
                    :isInForm="true"
                    class="red-button"
                >
                    Delete
                </the-button>

                <the-button
                    :regularButton="true"
                    :isInForm="true"
                    class="white-button"
                >
                    Cancel
                </the-button>
            </div>
        </template>
    </dialogs-template>
</template>

<script setup lang="ts">
import DialogsTemplate from './DialogsTemplate.vue'
import TheButton from '../shared/TheButton.vue'
import { computed } from 'vue'

const props = defineProps<{
    elementToDelete: 'board' | 'task',
    elementName: string,
    closeDialog: () => void
}>()

const message = computed(() => {
    const prefix = `Are you sure you want to delete the '${props.elementName}'`
    const suffix = props.elementToDelete === 'board' ?
    'This action will remove all columns and tasks and cannot be reversed.' :
    'This action cannot be reversed.'

    return `${prefix} ${props.elementToDelete}${props.elementToDelete === 'task' ?
    ' and its subtasks' :
    ''}?
    ${suffix}`
})
</script>

<style scoped>
.red-button {
    @apply text-white bg-red-400 hover:bg-red-200 focus:bg-red-200;
    @apply transition-colors duration-300 outline-none;
}
</style>
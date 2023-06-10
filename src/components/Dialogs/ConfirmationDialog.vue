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
                    class="button-one-bg"
                >
                    Delete
                </the-button>

                <the-button
                    :regularButton="true"
                    :isInForm="true"
                    class="button-two-bg"
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
.button-one-bg {
    @apply text-white bg-red-400 hover:bg-red-200 transition-all duration-300;
}

.button-two-bg {
    @apply text-purple-400 bg-purple-320 dark:bg-white;
    @apply hover:bg-purple-100 transition-all duration-300;
}
</style>
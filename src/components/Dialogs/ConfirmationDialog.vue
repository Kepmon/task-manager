<template>
    <dialogs-template
        :formTitle="`Delete this ${elementToDelete}?`"
        :isTitleRed="true"
        :closeDialog="closeDialog"
    >
        <template v-slot:main-content>
            <p class="text-sm text-medium-grey font-normal">
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
    @apply text-white bg-regular-red hover:bg-red-hover transition-all duration-300;
}

.button-two-bg {
    @apply text-main-purple bg-transparent-purple dark:bg-white;
    @apply hover:bg-main-purple-hover transition-all duration-300;
}
</style>
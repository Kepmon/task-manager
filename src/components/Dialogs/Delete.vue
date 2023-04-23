<template>
<dialog-backdrop>
    <div class="delete-container">
        <p class="text-lg text-regular-red">Delete this {{ elementToDelete }}?</p>
        <p class="text-s text-medium-grey font-normal">
            {{ message }}
        </p>

        <div class="flex flex-col gap-4 min-[512px]:flex-row">
            <the-button
                :regularButton="true"
                background="red"
                class="delete-button">
                Delete
            </the-button>
            <the-button
                :regularButton="true"
                background="white"
                class="cancel-button">
                Cancel
            </the-button>
        </div>
    </div>
</dialog-backdrop>
</template>

<script setup lang="ts">
import DialogBackdrop from './elements/DialogBackdrop.vue'
import TheButton from '../shared/TheButton.vue'
import { computed } from 'vue'

const props = defineProps<{
    elementToDelete: 'board' | 'task',
    elementName: string
}>()

const message = computed(() => {
    const prefix = `Are you sure you want to delete the ${props.elementName}`
    const suffix = props.elementToDelete === 'board' ?
    'This action will remove all columns and tasks and cannot be reversed.' :
    'This action cannot be reversed.'

    return `${prefix} ${props.elementToDelete}? ${suffix}`
})
</script>

<style scoped>
.delete-container {
    @apply flex flex-col gap-6 p-4 min-[300px]:p-6 w-[90%] sm:w-[480px];
    @apply bg-white dark:bg-dark-grey rounded-md;
}

.delete-button {
    @apply w-full text-s text-white hover:bg-red-hover transition-all duration-300;
}

.cancel-button {
    @apply w-full text-s text-main-purple bg-transparent-purple dark:bg-white;
    @apply hover:bg-semitransparent-purple dark:hover:bg-white transition-all duration-300;
}
</style>
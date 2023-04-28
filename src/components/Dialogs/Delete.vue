<template>
    <p class="text-s text-medium-grey font-normal">
        {{ message }}
    </p>
</template>

<script setup lang="ts">
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
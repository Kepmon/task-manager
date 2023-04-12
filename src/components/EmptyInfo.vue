<template>
    <div class="flex flex-col items-center justify-center">
        <p class="mb-[25px] text-lg text-medium-grey">
            {{ whatIsEmpty }} is empty. Create a new {{ createNew }} to get started.
        </p>
        <the-button :defaultClass="true">
            <img src="/img/icon-add-task-mobile.svg" alt="" class="h-3">
            <span class="text-white">{{ buttonText }}</span>
        </the-button>
    </div>
</template>

<script setup lang="ts">
import TheButton from '../components/shared/TheButton.vue'

defineProps<{
    whatIsEmpty: string,
    createNew: string,
    buttonText: string
}>()
</script>
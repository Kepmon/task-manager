<template>
    <div v-if="emptyDashboard || emptyBoard" class="flex flex-col items-center justify-center">
        <p class="mb-[25px] text-lg text-medium-grey">
            {{ emptyDashboard ? 'Your dashboard' : 'This board' }}
            is empty. Create a new
            {{ emptyDashboard ? 'board' : 'column' }}
            to get started.
        </p>
        <the-button
            :regularButton="true"
            class="w-max bg-main-purple hover:bg-main-purple-hover transition-all duration-300"
        >
            <img src="/img/icon-add-task-mobile.svg" alt="" class="h-3">
            <span class="text-white">
                Add New {{ emptyDashboard ? 'Board' : 'Column' }}
            </span>
        </the-button>
    </div>
</template>

<script setup lang="ts">
import TheButton from '../components/shared/TheButton.vue'
import { returnBoardProperties } from '../composables/boardProperties'
import { computed } from 'vue'

const boardProperties = returnBoardProperties()
const emptyDashboard = computed(() => boardProperties.boards.length === 0)
const emptyBoard = computed(() => boardProperties.columns.length === 0)
</script>
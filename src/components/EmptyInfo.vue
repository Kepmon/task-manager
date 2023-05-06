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
            class="gap-[2px] w-max bg-main-purple hover:bg-main-purple-hover transition-all duration-300"
        >
            <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" class="scale-[.7]">
                <path fill="#FFF" d="M7.368 12V7.344H12V4.632H7.368V0H4.656v4.632H0v2.712h4.656V12z"/>
            </svg>
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
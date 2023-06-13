<template>
    <div v-if="emptyDashboard || emptyBoard" class="flex flex-col items-center justify-center">
        <p class="mb-[25px] text-lg text-center text-gray-400 first-letter:capitalize">
            {{ emptyInfoSpans.spanOne }}
            is empty. Create a new
            {{ emptyInfoSpans.spanTwo }}
            to get started.
        </p>
        <the-button
            :regularButton="true"
            class="gap-[2px] w-max purple-class"
        >
            + Add New <span class="capitalize">{{ emptyInfoSpans.spanTwo }}</span>
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

const emptyInfoSpans = computed(() => {
    if (emptyDashboard.value) {
        return {
            spanOne: 'your dashboard',
            spanTwo: 'board'
        }
    }

    return {
        spanOne: 'this board',
        spanTwo: 'column'
    }
})
</script>
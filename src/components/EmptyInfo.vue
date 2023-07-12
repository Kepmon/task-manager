<template>
  <div
    v-if="emptyDashboard || emptyBoard"
    class="grid content-center justify-items-center"
  >
    <p
      class="mb-[25px] text-lg text-center text-gray-400 first-letter:capitalize"
    >
      {{ message }}
    </p>
    <the-button :regularButton="true" class="gap-[2px] w-max purple-class">
      + Add New
      <span class="capitalize">{{ emptyDashboard ? 'board' : 'column' }}</span>
    </the-button>
  </div>
</template>

<script setup lang="ts">
import TheButton from '../components/shared/TheButton.vue'
import { computed } from 'vue'

const props = defineProps<{
  emptyDashboard: boolean
  emptyBoard: boolean
}>()

const message = computed(
  () =>
    `${
      props.emptyDashboard ? 'your dashboard' : 'this board'
    } is empty. Create a new ${props.emptyDashboard ? 'board' : 'column'}.`
)
</script>

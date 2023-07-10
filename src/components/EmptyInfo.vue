<template>
  <div
    v-if="(emptyDashboard || emptyBoard) && !isLoading"
    class="grid content-center justify-items-center"
  >
    <p
      class="mb-[25px] text-lg text-center text-gray-400 first-letter:capitalize"
    >
      {{ message }}
    </p>
    <the-button
      @click="isBoardDialogShown = true"
      :regularButton="true"
      class="gap-[2px] w-max purple-class"
    >
      + Add New
      <span class="capitalize">{{ emptyDashboard ? 'board' : 'column' }}</span>
    </the-button>
    <transition name="dialog">
      <board-dialog
        v-if="isBoardDialogShown"
        @close-dialog="isBoardDialogShown = false"
        action="add"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import TheButton from '../components/shared/TheButton.vue'
import BoardDialog from './Dialogs/BoardDialog.vue'
import { ref, computed } from 'vue'

const props = defineProps<{
  emptyDashboard: boolean
  emptyBoard: boolean
  isLoading: boolean
}>()

const isBoardDialogShown = ref(false)

const message = computed(
  () =>
    `${
      props.emptyDashboard ? 'your dashboard' : 'this board'
    } is empty. Create a new ${props.emptyDashboard ? 'board' : 'column'}.`
)
</script>

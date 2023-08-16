<template>
  <div
    v-if="emptyDashboard || emptyBoard"
    class="grid content-center justify-items-center min-h-screen"
  >
    <p
      class="mb-[25px] text-lg text-center text-gray-400 first-letter:capitalize"
    >
      {{ message }}
    </p>
    <the-button
      @click="isBoardModalShown = true"
      :regularButton="true"
      class="gap-[2px] w-max purple-class"
    >
      + Add New
      <span class="capitalize">{{ emptyDashboard ? 'board' : 'column' }}</span>
    </the-button>
    <transition name="modal">
      <board-modal
        v-if="isBoardModalShown"
        @close-modal="isBoardModalShown = false"
        :action="emptyDashboard ? 'add' : 'edit'"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import TheButton from '../components/shared/TheButton.vue'
import BoardModal from './Modals/BoardModal.vue'
import { ref, computed } from 'vue'

const props = defineProps<{
  emptyDashboard: boolean
  emptyBoard: boolean
}>()

const isBoardModalShown = ref(false)

const message = computed(
  () =>
    `${
      props.emptyDashboard ? 'your dashboard' : 'this board'
    } is empty. Create a new ${props.emptyDashboard ? 'board' : 'column'}.`
)
</script>

<template>
  <div
    v-if="emptyDashboard || emptyBoard"
    class="grid content-center justify-items-center h-full"
  >
    <theme-toggle
      class="absolute top-0 px-8 bg-white dark:bg-gray-700 rounded-b-3xl sm:hidden"
    />
    <p
      class="mb-[25px] text-lgFluid text-center text-gray-400 first-letter:capitalize"
    >
      {{ message }}
    </p>
    <button
      @click="isBoardModalShown = true"
      :regularButton="true"
      class="w-max regular-button purple-class gap-[2px]"
    >
      &#65291; Add New
      <span class="capitalize">{{ emptyDashboard ? 'board' : 'column' }}</span>
    </button>
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
import BoardModal from './Modals/BoardModal.vue'
import ThemeToggle from './shared/ThemeToggle.vue'
import { ref, computed } from 'vue'

const props = defineProps<{
  emptyDashboard?: boolean
  emptyBoard?: boolean
}>()

const isBoardModalShown = ref(false)

const message = computed(
  () =>
    `${
      props.emptyDashboard ? 'your dashboard' : 'this board'
    } is empty. Create a new ${
      props.emptyDashboard ? 'board.' : 'column to get started.'
    }`
)
</script>

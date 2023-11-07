<template>
  <div class="grid content-center justify-items-center h-full">
    <theme-toggle v-if="emptyDashboard && width < 640" class="absolute top-0" />
    <p
      class="mb-[25px] text-lgFluid text-center text-gray-400 first-letter:capitalize"
    >
      {{ message }}
    </p>
    <button
      @click="isModalShown = true"
      :regularButton="true"
      class="w-max regular-button purple-class gap-[2px] capitalize"
    >
      &#65291; Add New {{ emptyDashboard ? 'board' : 'column' }}
    </button>
    <transition name="modal">
      <board-modal
        v-if="isModalShown && emptyDashboard"
        @close-modal="isModalShown = false"
        action="add"
      />
    </transition>
    <transition name="modal">
      <new-column-modal
        v-if="isModalShown && !emptyDashboard"
        @close-modal="isModalShown = false"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import BoardModal from './Modals/BoardModal.vue'
import NewColumnModal from './Modals/NewColumnModal.vue'
import ThemeToggle from './shared/ThemeToggle.vue'
import { ref, computed } from 'vue'

const props = defineProps<{
  emptyDashboard: boolean
  width: number
}>()

const isModalShown = ref(false)

const message = computed(
  () =>
    `${
      props.emptyDashboard ? 'your dashboard' : 'this board'
    } is empty. Create a new ${
      props.emptyDashboard ? 'board.' : 'column to get started.'
    }`
)
</script>

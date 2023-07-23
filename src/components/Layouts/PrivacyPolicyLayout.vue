<template>
  <div v-if="currentPath !== '/privacy-policy'" class="privacy-policy-popup">
    <button
      @click="$emit('close-popup')"
      aria-label="Click here to close the popup"
      class="close-button"
      :class="{ 'motion-safe:after:animate-ping-once': animationCondition }"
    >
      <close-icon />
    </button>

    <privacy-policy-content />
  </div>

  <main v-else class="py-8 px-2 mx-auto max-w-[1200px]">
    <privacy-policy-content />
  </main>
</template>

<script setup lang="ts">
import CloseIcon from '../Svgs/CloseIcon.vue'
import PrivacyPolicyContent from '../PrivacyPolicyContent.vue'
import { useRoute } from 'vue-router'

defineProps<{
  animationCondition?: boolean
}>()
defineEmits(['close-popup'])

const currentPath = useRoute().path
</script>

<style lang="postcss" scoped>
.privacy-policy-popup {
  @apply grid absolute inset-x-0 inset-y-6 s:inset-x-10 py-12 px-4 s:px-8 s:py-8;
  @apply mt-10 mx-auto max-w-[1200px] font-normal rounded-3xl;
  @apply border-4 border-purple-400 border-double;
  @apply bg-gray-200 dark:bg-gray-800 overflow-auto scrollbar-invisible;
}

.close-button {
  @apply absolute top-0 right-1/2 max-[512px]:translate-x-1/2;
  @apply s:top-2 s:right-2 p-3 cursor-pointer;
  @apply after:absolute after:inset-0 after:border-2 after:rounded-full;
  @apply after:border-black dark:after:border-white;
}
</style>

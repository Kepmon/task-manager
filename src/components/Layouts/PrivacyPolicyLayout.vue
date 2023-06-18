<template>
  <div v-if="currentPath !== '/privacy-policy'" class="privacy-policy-popup">
    <button
      aria-label="Click here to close the popup"
      class="close-button"
      :class="{ 'motion-safe:after:animate-ping-once': animationCondition }"
      @click="closePopup"
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
import CloseIcon from "../Svgs/CloseIcon.vue";
import PrivacyPolicyContent from "../PrivacyPolicyContent.vue";
import { useRoute } from "vue-router";

defineProps<{
  closePopup?: () => void;
  animationCondition?: boolean;
}>();

const currentPath = useRoute().path;
</script>

<style scoped lang="postcss">
.privacy-policy-popup {
  @apply absolute inset-x-0 inset-y-10 min-[480px]:inset-x-10 py-8 px-4 min-[480px]:px-8;
  @apply mx-auto max-w-[1200px] font-normal rounded-3xl;
  @apply border-4 border-purple-400 border-double;
  @apply bg-gray-200 dark:bg-gray-800 overflow-auto scrollbar-invisible;
}

.close-button {
  @apply absolute top-0 right-1/2 max-[480px]:translate-x-1/2;
  @apply min-[480px]:top-2 min-[480px]:right-2 p-3 cursor-pointer;
  @apply after:absolute after:inset-0 after:border-2 after:rounded-full;
  @apply after:border-black dark:after:border-white;
}
</style>

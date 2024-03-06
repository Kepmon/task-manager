<template>
  <div
    v-if="currentPath !== '/privacy-policy'"
    ref="privacyPolicyPopup"
    class="privacy-policy-popup"
  >
    <close-icon
      @handle-close="$emit('close-popup')"
      :isPolicy="true"
      class="close-button"
      :class="{ 'motion-safe:after:animate-ping-once': animationCondition }"
    />

    <privacy-policy-content />
  </div>

  <main v-else class="py-8 px-2 mx-auto max-w-[1200px]">
    <privacy-policy-content />
  </main>
</template>

<script setup lang="ts">
import CloseIcon from '../svgs/CloseIcon.vue'

defineProps<{
  animationCondition?: boolean
}>()
const emits = defineEmits(['close-popup'])

const currentPath = useRoute().path

const privacyPolicyPopup = ref(null)

onClickOutside(privacyPolicyPopup, () => emits('close-popup'))
</script>

<style lang="postcss" scoped>
.privacy-policy-popup {
  @apply grid absolute inset-x-0 inset-y-6 s:inset-x-10 py-12 px-4 s:px-3 s:py-2;
  @apply mt-10 mx-auto max-w-[1200px] font-normal rounded-3xl;
  @apply border-4 border-purple-400 border-double z-10;
  @apply bg-gray-200 dark:bg-gray-800 overflow-auto scrollbar-invisible;
}

.close-button {
  @apply grid place-content-center absolute top-0 left-1/2 max-[512px]:-translate-x-1/2;
  @apply s:top-2 s:left-[calc(100%-4rem)] p-3 h-6 w-6;
  @apply after:absolute after:inset-0 after:border-2 after:rounded-full;
  @apply after:border-black dark:after:border-white after:pointer-events-none;
}
</style>

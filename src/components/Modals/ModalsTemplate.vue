<template>
  <div @click.self="$emit('close-modal')" class="semitransparent-bg">
    <UseFocusTrap :options="{ immediate: true, allowOutsideClick: true }">
      <form
        @submit.prevent="$emit('submit-form')"
        class="form"
        :class="allowOverflow ? '' : 'overflow-auto'"
        data-form
      >
        <div class="flex items-center justify-between gap-2 xs:gap-4">
          <header class="xs:text-lg">
            <slot name="form-title"></slot>
          </header>
          <slot name="ellipsis"></slot>
        </div>
        <slot name="main-content"></slot>
      </form>
    </UseFocusTrap>
  </div>
</template>

<script setup lang="ts">
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component'
import { onMounted, onUnmounted } from 'vue'

defineProps<{
  allowOverflow?: true
}>()

const emits = defineEmits(['close-modal', 'submit-form'])

const closeModalOnEsc = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return

  emits('close-modal')
}

onMounted(() => {
  window.addEventListener('keydown', closeModalOnEsc)
})
onUnmounted(() => {
  window.removeEventListener('keydown', closeModalOnEsc)
})
</script>

<style lang="postcss" scoped>
.semitransparent-bg {
  @apply grid place-items-center absolute inset-0;
  @apply z-50 p-4 bg-gray-880;
}

.form {
  @apply grid gap-6 relative p-6 max-h-[95vh];
  @apply w-[min(90vw,480px)] rounded-md bg-white dark:bg-gray-700;
  @apply scrollbar-invisible;
}
</style>

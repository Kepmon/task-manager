<template>
  <div @click.self="$emit('close-modal')" class="semitransparent-bg">
    <UseFocusTrap :options="{ immediate: true, allowOutsideClick: true }">
      <form @submit.prevent="$emit('submit-form')" class="form">
        <div class="flex items-center justify-between gap-2 xs:gap-4">
          <header class="xs:text-lg first-letter:uppercase">
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

const emits = defineEmits(['close-modal', 'submit-form'])

const closeModalOnEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emits('close-modal')
  }
}

onMounted(() => {
  window.addEventListener('keydown', (e: KeyboardEvent) => closeModalOnEsc(e))
})
onUnmounted(() => {
  window.removeEventListener('keydown', (e: KeyboardEvent) =>
    closeModalOnEsc(e)
  )
})
</script>

<style lang="postcss" scoped>
.semitransparent-bg {
  @apply flex items-center justify-center absolute z-50 p-4;
  @apply inset-0 bg-gray-880;
}

.form {
  @apply flex flex-col gap-6 relative p-6 w-[90%] max-h-[95vh];
  @apply sm:w-[480px] rounded-md bg-white dark:bg-gray-700;
  @apply overflow-auto scrollbar-invisible;
}
</style>

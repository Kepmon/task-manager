<template>
  <div @click.self="$emit('close-dialog')" class="semitransparent-bg">
    <UseFocusTrap :options="{ immediate: true, allowOutsideClick: true }">
      <form class="form">
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

const emits = defineEmits(['close-dialog'])

const closeDialogOnEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emits('close-dialog')
  }
}

onMounted(() => {
  window.addEventListener('keydown', (e: KeyboardEvent) => closeDialogOnEsc(e))
})
onUnmounted(() => {
  window.removeEventListener('keydown', (e: KeyboardEvent) => closeDialogOnEsc(e))
})
</script>

<style scoped>
.semitransparent-bg {
  @apply flex items-center justify-center absolute z-10 p-4;
  @apply inset-0 bg-gray-880;
}

.form {
  @apply flex flex-col gap-6;
  @apply relative p-6 w-[90%] sm:w-[480px] rounded-md bg-white dark:bg-gray-700;
}
</style>

<template>
  <transition name="options">
    <div
      v-if="condition"
      @click="$emit('toggle-options')"
      ref="target"
      class="options-container"
      :class="{
        'right-6 top-[76px]': element === 'board',
        'right-0 -top-4': element === 'task'
      }"
    >
      <button
        @click.prevent="$emit('show-edit-form')"
        class="option option--edit"
      >
        Edit {{ element }}
      </button>
      <button
        @click.prevent="$emit('show-delete-form')"
        class="option option--delete"
      >
        Delete {{ element }}
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

defineProps<{
  condition: boolean
  element: 'task' | 'board'
}>()
const emits = defineEmits([
  'toggle-options',
  'show-edit-form',
  'show-delete-form',
  'close-more-options'
])

const target = ref(null)
onClickOutside(target, (e: Event) => emits('close-more-options', e))
</script>

<style scoped>
.option--edit {
  @apply rounded-t-lg;
}
</style>

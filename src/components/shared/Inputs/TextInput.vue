<template>
  <div class="grid gap-2">
    <label v-if="label" class="text-xs">{{ label }}</label>
    <input
      @blur="$emit('handle-blur')"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :ref="condition ? 'newInput' : undefined"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="input"
      :class="{
        'border-red-400': isError,
        'border-blue-40 focus:border-purple-400': !isError,
        'placeholder:text-inherit': whitePlaceholder
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  label?: string
  isError?: boolean
  placeholder?: string
  whitePlaceholder?: boolean
  modelValue?: string
  value?: string
  condition?: boolean
}>()
defineEmits(['handle-blur', 'update:modelValue'])

const newInput = ref<null | HTMLInputElement>(null)
onMounted(() => {
  if (props.condition) {
    ;(newInput.value as HTMLInputElement).focus()
  }
})
</script>

<template>
  <div class="grid gap-2">
    <label v-if="label" class="text-xs">{{ label }}</label>
    <input
      @blur="$emit('handle-blur')"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :value="modelValue?.includes('e.g.') ? '' : modelValue"
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
defineProps<{
  label?: string
  isError?: boolean
  placeholder?: string
  whitePlaceholder?: boolean
  modelValue?: string
  value?: string
}>()
defineEmits(['handle-blur', 'update:modelValue'])
</script>

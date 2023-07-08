<template>
  <div class="grid gap-2">
    <label v-if="label" class="text-xs">{{ label }}</label>
    <input
      @blur="$emit('handle-blur')"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="input"
      :class="{
        'border-red-400': isError,
        'border-blue-40 focus:border-purple-400': !isError
      }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  isError: boolean
  placeholder?: string
  modelValue: string
}>()
defineEmits(['handle-blur', 'update:modelValue'])
</script>

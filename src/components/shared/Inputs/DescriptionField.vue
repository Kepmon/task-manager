<template>
  <div class="grid gap-2">
    <label v-if="label" :for="idAttr" class="text-xs">{{ label }}</label>
    <textarea
      @input="
        $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
      "
      :id="idAttr"
      :value="modelValue"
      class="input min-h-[80px] max-h-[150px] scrollbar-invisible border-blue-40 focus-visible:border-purple-400"
      placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
    ></textarea>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  idAttr: string
  modelValue: string
}>()

defineEmits(['update:modelValue'])
</script>

<style lang="postcss" scoped>
.input {
  @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-sm font-normal;
  @apply outline outline-transparent border;
}
</style>

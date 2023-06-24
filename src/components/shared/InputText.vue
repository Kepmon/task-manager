<template>
  <div :class="{ 'flex flex-col gap-2': label }">
    <label v-if="label" class="text-xs">{{ label }}</label>
    <input
      v-if="type === 'text'"
      :type="type"
      class="input"
      :class="{
        'border-red-400': error,
        'border-blue-40 focus:border-purple-400': !error
      }"
      :placeholder="placeholder"
      :value="customValue ? customValue : ''"
    />
    <Field
      v-if="type === 'email' || type === 'password'"
      :id="name"
      :type="type"
      :placeholder="placeholder"
      :name="name"
      class="input"
      :class="{
        'border-red-400': errorMessage,
        'border-blue-40 focus:border-purple-400': !errorMessage
      }"
    />
    <ErrorMessage :name="name" class="font-normal text-xs text-red-400" />
    <textarea
      v-if="type === 'textarea'"
      class="input min-h-[80px] max-h-[150px] scrollbar-invisible"
      :class="{ 'border-blue-40 focus:border-purple-400': !error }"
      placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { Field, ErrorMessage, useField } from 'vee-validate'

const props = defineProps<{
  label?: string
  placeholder?: string
  customValue?: string
  error?: boolean
  formType?: 'add' | 'edit'
  name: string
  type: HTMLInputElement['type']
}>()

const name = toRef(props, 'name')
const { errorMessage } = useField(name)
</script>

<style scoped>
.input {
  @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-sm font-normal;
  @apply outline outline-transparent border;
}
</style>

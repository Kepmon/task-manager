<template>
  <div class="grid gap-2">
    <label class="text-xs">{{ label }}</label>
    <Field
      :id="name"
      :type="type"
      :name="name"
      class="input"
      :class="{
        'border-red-400': errorMessage,
        'border-blue-40 focus:border-purple-400': !errorMessage
      }"
    />
    <ErrorMessage :name="name" class="font-normal text-xs text-red-400" />
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { Field, ErrorMessage, useField } from 'vee-validate'

const props = defineProps<{
  label: string
  name: string
  type: HTMLInputElement['type']
}>()

const name = toRef(props, 'name')
const { errorMessage } = useField(name)
</script>

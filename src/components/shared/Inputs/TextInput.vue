<template>
  <div class="grid gap-2">
    <label v-if="label" :for="forAttr" class="text-xs">{{ label }}</label>
    <div :class="{ 'input-error': isError }">
      <input
        @input="(e: Event) => handleInput(e)"
        @blur="$emit('handle-blur')"
        :id="idAttr"
        :ref="condition ? 'newInput' : undefined"
        :value="modelValue"
        type="text"
        :placeholder="placeholder"
        class="input"
        :class="{
          'border-red-400': isError,
          'border-blue-40 focus-visible:border-purple-400': !isError,
          'placeholder:text-inherit': whitePlaceholder
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFormsStore } from '../../../stores/forms'

const props = defineProps<{
  label?: string
  forAttr?: string
  idAttr?: string
  isError?: boolean
  placeholder?: string
  whitePlaceholder?: boolean
  modelValue?: string
  value?: string
  condition?: boolean
}>()
const emits = defineEmits(['handle-blur', 'update:modelValue'])

const formsStore = useFormsStore()
const newInput = ref<null | HTMLInputElement>(null)

const handleInput = (e: Event) => {
  emits('update:modelValue', (e.target as HTMLInputElement).value)
  emits('handle-blur')
}

onMounted(() => {
  if (props.condition && newInput.value) {
    newInput.value.focus()
  }
})

onUnmounted(() => {
  formsStore.isNewInputAdded = false
})
</script>

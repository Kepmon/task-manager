<template>
  <div class="grid gap-2" role="dialog" aria-modal="true">
    <label v-if="label" :for="idAttr" class="text-xs">{{ label }}</label>
    <div class="relative">
      <input-error
        v-if="emptyError || tooLongError"
        :message="
          emptyError ? 'Can\'t be empty' : 'Can\'t be longer than 100 chars'
        "
      />
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
          'border-red-400': emptyError || tooLongError,
          'border-blue-40 focus-visible:border-purple-400':
            !emptyError && !tooLongError,
          'placeholder:text-inherit': whitePlaceholder
        }"
        aria-required="true"
        :aria-invalid="emptyError || tooLongError ? true : undefined"
        :name="nameAttr || undefined"
        :aria-label="ariaLabel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputError from './InputError.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFormsStore } from '../../../stores/forms'

const props = defineProps<{
  fieldDescription: string
  label?: string
  idAttr?: string
  emptyError?: boolean
  tooLongError?: boolean
  placeholder?: string
  whitePlaceholder?: boolean
  modelValue?: string
  condition?: boolean
  nameAttr?: string
}>()
const emits = defineEmits(['handle-blur', 'update:modelValue'])

const formsStore = useFormsStore()
const newInput = ref<null | HTMLInputElement>(null)

const handleInput = (e: Event) => {
  emits('update:modelValue', (e.target as HTMLInputElement).value)
  emits('handle-blur')
}

const ariaLabel = computed(() => {
  if (!props.emptyError && !props.tooLongError) return undefined

  if (props.emptyError)
    return `Error: Please fill in this ${props.fieldDescription} field`

  return `Error: Maximum number of characters for the ${props.fieldDescription} field is 80`
})

onMounted(() => {
  if (props.condition && newInput.value != null) {
    newInput.value.focus()
  }
})

onUnmounted(() => {
  formsStore.isNewInputAdded = false
})
</script>

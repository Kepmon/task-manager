<template>
    <div :class="{ 'flex flex-col gap-2': label}">
        <label v-if="label" :for="name" class="text-xs">{{ label }}</label>
        <input
            v-if="type !== 'textarea'"
            @keyup="$emit('emit-values', inputValue, $event.target)"
            @input="handleChange"
            @blur="handleBlur"
            :type="type"
            :id="name"
            :placeholder="errorMessage ? errorMessage : placeholder"
            :value="customValue ? customValue : inputValue"
            class="input"
            :class="{
                'border-red-400 placeholder:text-right placeholder:text-red-400': errorMessage,
                'border-blue-40 focus:border-purple-400': !error
            }"
        >
        <span v-show="errorMessage !== 'Can\'t be empty'" class="font-normal text-xs text-red-400">
            {{ errorMessage }}
        </span>
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
import { useField } from 'vee-validate'

const props = defineProps<{
    label?: string,
    placeholder?: string,
    customValue?: string,
    error?: boolean,
    formType?: 'add' | 'edit',
    name: string,
    type: 'text' | 'email' | 'password' | 'textarea'
}>()


const name = toRef(props, 'name')
const {
  value: inputValue, errorMessage, handleBlur, handleChange
} = useField(name)
</script>

<style scoped>
.input {
    @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-sm font-normal;
    @apply outline-none border;
}
</style>
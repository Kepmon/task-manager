<template>
    <div :class="{ 'flex flex-col gap-2': label}">
        <label v-if="label" class="text-xs">{{ label }}</label>
        <input
            v-if="type === 'input'"
            type="text"
            class="input"
            :class="{ 'border-red-400': error, 'border-blue-40 focus:border-purple-400': !error }"
            :placeholder="placeholder"
            :value="inputValue"
        >
        <textarea
            v-if="type === 'textarea'"
            class="input min-h-[80px] max-h-[150px] scrollbar-invisible"
            :class="{ 'border-blue-40 focus:border-purple-400': !error }"
            placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
        ></textarea>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label?: string,
    placeholder?: string,
    inputValue?: string,
    error?: boolean,
    formType: 'add' | 'edit',
    type: 'input' | 'textarea'
}>()
</script>

<style scoped>
.input {
    @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-sm font-normal;
    @apply outline-none border;
}
</style>
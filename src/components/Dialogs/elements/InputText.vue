<template>
    <div :class="{ 'flex flex-col gap-2': label}">
        <label v-show="label" class="text-sm">{{ label }}</label>
        <input
            v-show="type === 'input'"
            type="text"
            class="input"
            :class="{ 'border-regular-red': error, 'border-input-border focus:border-main-purple': !error }"
            :placeholder="formType === 'Add' ? placeholder : undefined"
            :value="formType === 'Edit' ? inputValue : undefined"
        >
        <textarea
            v-show="type === 'textarea'"
            class="input min-h-[80px] max-h-[150px] scrollbar-invisible"
            :class="{ 'border-input-border focus:border-main-purple': !error }"
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
    formType: 'SeeTask' | 'Add' | 'Edit' | 'Delete',
    type: 'input' | 'textarea'
}>()
</script>

<style scoped>
.input {
    @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-s font-normal;
    @apply outline-none border;
}
</style>
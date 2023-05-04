<template>
    <div>
        <label class="text-sm">{{ label }}</label>
        <input
            v-show="type === 'input'"
            type="text"
            class="input"
            :placeholder="formType === 'Add' ? placeholder : undefined"
            :value="formType === 'Edit' ? inputValue : undefined"
        >
        <textarea
            v-show="type === 'textarea'"
            class="input min-h-[80px] max-h-[150px] scrollbar-invisible"
            placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
        ></textarea>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string,
    placeholder?: string,
    inputValue?: string
    formType: 'SeeTask' | 'Add' | 'Edit' | 'Delete',
    type: 'input' | 'textarea'
}>()
</script>

<style scoped>
.input {
    @apply py-3 px-4 mt-2 w-full bg-transparent rounded-[4px] text-s font-normal;
    @apply outline-none border border-input-border focus:border-input-border-focus;
}
</style>
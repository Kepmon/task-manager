<template>
<div>
    <label class="text-sm">{{ label }}</label>
    <input
        v-show="type === 'input'"
        type="text"
        class="input"
        :placeholder="action === 'add' ? placeholder : ''"
    >
    <textarea
        v-show="type === 'textarea'"
        class="input min-h-[80px] max-h-[150px] scrollbar-invisible"
        :placeholder="action === 'add' ? placeholder : ''"
    ></textarea>
</div>
</template>

<script setup lang="ts">
defineProps<{
    label: string,
    placeholder: string
    action: 'add' | 'edit',
    type: 'input' | 'textarea'
}>()
</script>

<style scoped>
.input {
    @apply py-3 px-4 mt-2 w-full bg-transparent rounded-[4px] text-s font-normal;
    @apply outline-none border border-input-border focus:border-input-border-focus;
}
</style>
<template>
<button
    :class="{
        'flex items-center justify-center gap-2 w-full py-[10px] px-4 rounded-3xl shadow-sm': regularButton,
        'text-s': isInForm
    }"
>
    <slot></slot>
</button>
</template>

<script setup lang="ts">
defineProps<{
    regularButton: boolean,
    isInForm?: true
}>()
</script>
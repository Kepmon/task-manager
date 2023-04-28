<template>
<button
    :class="{
        'flex items-center justify-center gap-2 w-full py-[10px] px-4 rounded-3xl shadow-sm': regularButton,
        'bg-main-purple': background === 'purple',
        'bg-white-purple': background === 'whitePurple',
        'bg-white': background === 'white',
        'bg-regular-red': background === 'red',
        'text-s': isInForm
    }"
>
    <slot></slot>
</button>
</template>

<script setup lang="ts">
defineProps<{
    regularButton: boolean,
    background: 'purple' | 'whitePurple' | 'white' | 'red',
    isInForm?: true
}>()
</script>
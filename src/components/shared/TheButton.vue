<template>
<button :class="{ 'flex items-center gap-2 rounded-3xl bg-main-purple py-[10px] px-4 shadow-sm': defaultClass }">
    <slot></slot>
</button>
</template>

<script setup lang="ts">
defineProps<{
    defaultClass: boolean
}>()
</script>

<style scoped>

</style>
<template>
    <div class="semitransparent-bg" @click.self="closeDialog">
        <form class="form">
            <div class="flex items-center justify-between gap-2 min-[350px]:gap-4">
                <header class="min-[350px]:text-lg first-letter:uppercase">
                    <slot name="form-title"></slot>
                </header>
                <slot name="ellipsis"></slot>
            </div>
            <slot name="main-content"></slot>
        </form>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    closeDialog: () => void
}>()
</script>

<style scoped>
.semitransparent-bg {
    @apply flex items-center justify-center absolute z-10 p-4;
    @apply inset-0 bg-gray-880;
}

.form {
    @apply flex flex-col gap-6;
    @apply relative p-6 w-[90%] sm:w-[480px] rounded-md bg-white dark:bg-gray-700;
}
</style>
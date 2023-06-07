<template>
    <transition name="dialog">
        <div class="semitransparent-bg" @click.self="closeDialog">
            <form class="form">
                <div class="flex items-center justify-between gap-2 min-[350px]:gap-4">
                    <p
                        class="min-[350px]:text-lg first-letter:uppercase"
                        :class="{ 'text-regular-red': isTitleRed }"
                    >
                        {{ formTitle }}
                    </p>
                    <slot name="ellipsis"></slot>
                </div>
                <slot name="main-content"></slot>
            </form>
        </div>
    </transition>
</template>

<script setup lang="ts">
defineProps<{
    isTitleRed?: true,
    formTitle: string,
    closeDialog: () => void
}>()
</script>


<style scoped>
.dialog-enter-from,
.dialog-leave-to {
    @apply opacity-0;
}

.dialog-enter-active,
.dialog-leave-active {
    @apply transition-opacity duration-300;
}

.semitransparent-bg {
    @apply flex items-center justify-center absolute z-10 p-4;
    @apply inset-0 bg-semitransparent-black;
}

.form {
    @apply flex flex-col gap-6;
    @apply relative p-6 w-[90%] sm:w-[480px] rounded-md bg-white dark:bg-dark-grey;
}
</style>
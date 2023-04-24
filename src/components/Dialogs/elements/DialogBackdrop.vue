<template>
<transition name="dialog">
    <div class="semitransparent-bg">
        <slot></slot>
    </div>
</transition>
</template>

<style scoped>
.semitransparent-bg {
    @apply flex items-center justify-center absolute p-4 inset-0 bg-semitransparent-black;
}

.dialog-enter-from,
.dialog-leave-to {
  @apply opacity-0;
}

.dialog-enter-active,
.dialog-leave-active {
  @apply transition-opacity duration-300;
}
</style>
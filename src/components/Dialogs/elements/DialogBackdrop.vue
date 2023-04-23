<template>
<div class="semitransparent-bg">
    <slot></slot>
</div>
</template>

<style scoped>
.semitransparent-bg {
    @apply flex items-center justify-center absolute p-4 inset-0 bg-semitransparent-black;
}
</style>
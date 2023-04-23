<template>
    <form class="form">
        <more-options
            v-show="options && condition"
            element="Task"
            class="top-24 sm:top-20 right-12 sm:translate-x-1/2"
        />
        <div class="form-content">
            <slot name="mainContent"></slot>
        </div>
        <slot name="select"></slot>
    </form>
</template>

<script setup lang="ts">
import MoreOptions from '../../shared/MoreOptions.vue'

defineProps<{
    options: boolean
    condition?: boolean
}>()
</script>

<style scoped>
.form {
    @apply relative p-6 w-[90%] sm:w-[480px] rounded-md bg-white dark:bg-dark-grey;
}

.form-content {
    @apply flex flex-col gap-6 max-h-[85vh] overflow-y-scroll scrollbar-invisible;
}
</style>
<template>
  <button
    @click="$emit('handle-close')"
    class="p-2 box-content rounded-[4px] translate-x-1"
    :class="{
      'ml-auto group': isColumn,
      'focus-visible:outline-red-400': emptyError || tooLongError
    }"
    :aria-label="
      listItem || isPolicy
        ? 'click here to close off this field'
        : 'click here to delete the whole column'
    "
    :type="listItem ? 'button' : undefined"
  >
    <svg width="15" height="15" :class="{ 'scale-150': isPolicy }">
      <g
        :class="{
          'fill-red-400': emptyError || tooLongError,
          'fill-gray-400':
            (!emptyError && !tooLongError) || isColumn || isPolicy,
          'fill-gray-400 group-hover:fill-purple-600 group-focus-visible:fill-purple-600 transition-colors duration-300':
            isColumn
        }"
      >
        <path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z" />
        <path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z" />
      </g>
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  listItem?: true
  isColumn?: true
  isPolicy?: true
  emptyError?: boolean
  tooLongError?: boolean
}>()
defineEmits(['handle-close'])
</script>

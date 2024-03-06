<template>
  <button
    @click="$emit('toggle-options')"
    data-protected="ellipsis"
    :aria-label="`click here to see the ${element}-related options`"
    :aria-controls="`more-options-${element}`"
    :aria-expanded="expandedCondition ? true : false"
    class="px-3 py-2 rounded-md focus-visible:outline-gray-400"
  >
    <svg width="5" height="20" data-protected>
      <g fill-rule="evenodd" class="fill-gray-400">
        <circle cx="2.308" cy="2.308" r="2.308" />
        <circle cx="2.308" cy="10" r="2.308" />
        <circle cx="2.308" cy="17.692" r="2.308" />
      </g>
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  element: 'board' | 'task'
  expandedCondition: boolean
}>()
defineEmits(['toggle-options'])
</script>

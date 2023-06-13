<template>
    <privacy-policy-layout :closePopup="closePopup" />
</template>

<script setup lang="ts">
import PrivacyPolicyLayout from './Layouts/PrivacyPolicyLayout.vue'

defineProps<{
    closePopup: () => void
}>()
</script>
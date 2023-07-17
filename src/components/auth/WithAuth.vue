<script setup lang="ts">
import { useUserStore } from '../../stores/user'
import AuthLayout from '../Layouts/AuthLayout.vue'
const userStore = useUserStore()
</script>

<template>
  <div>
    <auth-layout v-if="userStore.isAuthenticated === false" />
    <slot v-else :user="userStore.user" />
  </div>
</template>

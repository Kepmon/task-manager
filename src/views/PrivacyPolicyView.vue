<template>
  <div>
    <router-link :to="link.path" class="link">
      Go To {{ link.text }}
    </router-link>
    <privacy-policy-layout />
  </div>
</template>

<script setup lang="ts">
import PrivacyPolicyLayout from '../components/Layouts/PrivacyPolicyLayout.vue'
import { useUserStore } from '../stores/user'
import { computed } from 'vue'

const userStore = useUserStore()

const link = computed(() => {
  return userStore.userID
    ? {
        path: '/dashboard',
        text: 'Dashboard'
      }
    : {
        path: '/',
        text: 'Login Page'
      }
})
</script>

<style lang="postcss">
.link {
  @apply block px-6 py-3 mx-auto w-max rounded-b-3xl;
  @apply bg-white dark:bg-gray-700 outline outline-transparent;
  @apply bg-purple-400 hover:bg-purple-600 focus:bg-purple-600;
  @apply transition-colors duration-300;
}
</style>

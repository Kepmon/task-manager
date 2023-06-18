<template>
  <div>
    <router-link :to="link.path" class="link">
      Go To {{ link.text }}
    </router-link>
    <privacy-policy-layout />
  </div>
</template>

<script setup lang="ts">
import PrivacyPolicyLayout from "../components/Layouts/PrivacyPolicyLayout.vue";
import { useUserStore } from "../stores/user";
import { computed } from "vue";

const { isSignedIn } = useUserStore();

const link = computed(() => {
  return isSignedIn
    ? {
        path: "/dashboard",
        text: "Dashboard",
      }
    : {
        path: "/",
        text: "Login Page",
      };
});
</script>

<style>
.link {
  @apply block px-6 py-3 mx-auto w-[max-content] rounded-b-3xl;
  @apply bg-white dark:bg-gray-700 outline-none;
  @apply bg-purple-400 hover:bg-purple-600 focus:bg-purple-600;
  @apply transition-colors duration-300;
}
</style>

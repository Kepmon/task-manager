<template>
  <p
    ref="confirmationPopup"
    class="popup-text"
    :class="{ 'opacity-0': !isResponseError }"
    tabindex="0"
  >
    {{ message }}
  </p>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'

const props = defineProps<{
  isResponseError: boolean
  errorMessage?: string
}>()

const route = useRoute()
const userStore = useUserStore()

const confirmationPopup = ref<null | HTMLElement>(null)
onMounted(() => {
  confirmationPopup.value?.focus()
})

onUnmounted(() => {
  confirmationPopup.value?.blur()
})

const message = computed(() => {
  if (props.isResponseError) {
    const isCustomMessage =
      userStore.deleteAccountError?.includes('auth/wrong-password') ||
      props.errorMessage === 'auth/wrong-password' ||
      props.errorMessage === 'auth/email-already-in-use' ||
      props.errorMessage === 'auth/user-not-found'

    if (route.path === '/dashboard' && isCustomMessage)
      return 'The password is incorrect'

    return isCustomMessage
      ? 'The user name or password are incorrect'
      : 'Ooops, something went wrong. Try again later.'
  }

  const successMessages = {
    '/': 'You logged in successfully',
    '/sign-up': 'You signed up successfully',
    '/dashboard': 'You successfully performed this action'
  }

  if (route.path === '/dashboard' && userStore.userID == null)
    return 'You logged out successfully'

  return successMessages[route.path as keyof typeof successMessages]
})
</script>

<style lang="postcss" scoped>
.popup-text {
  @apply fixed inset-0 bottom-auto py-10 mx-auto w-[min(90%,400px)];
  @apply translate-y-8 text-center text-gray-900 rounded-xl z-[100];
  @apply focus-visible:outline-transparent bg-red-400;
}

.popup-enter-from,
.popup-leave-to {
  @apply -translate-y-[1000px];
}

.popup-enter-active,
.popup-leave-active {
  @apply transition-transform duration-1000;
}
</style>

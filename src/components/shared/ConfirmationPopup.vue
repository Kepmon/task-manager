<template>
  <p
    class="popup-text"
    :class="{ 'bg-green-600': !isError, 'bg-red-400': isError }"
  >
    {{ message }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  isError: boolean
  errorMessage?: string
  action?: 'delete'
}>()

const authErrorText = {
  'auth/wrong-password': 'The provided password is incorrect',
  'auth/email-already-in-use': 'A user with this email already exists',
  'auth/user-not-found': 'No user exists with such email'
}

const message = computed(() => {
  if (props.isError) {
    return (
      authErrorText[props.errorMessage as keyof typeof authErrorText] ||
      'Ooops, something went wrong. Try again later.'
    )
  }

  if (props.action) {
    return 'You successfully deleted the your account'
  }

  const path = useRoute().path
  const action = {
    '/': 'logged in',
    '/sign-up': 'signed up',
    '/dashboard': 'logged out'
  }

  return `You ${action[path as keyof typeof action]} successfully`
})
</script>

<style lang="postcss" scoped>
.popup-text {
  @apply fixed inset-0 bottom-auto py-10 mx-auto w-[min(90%,400px)];
  @apply translate-y-8 text-center text-gray-900 rounded-xl z-[100];
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

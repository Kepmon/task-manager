<template>
  <p
    ref="confirmationPopup"
    class="popup-text"
    :class="{ 'bg-green-600': !isError, 'bg-red-400': isError }"
    tabindex="0"
  >
    {{ message }}
  </p>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  isError: boolean
  errorMessage?: string
  action?: 'delete'
}>()

const confirmationPopup = ref<null | HTMLElement>(null)
onMounted(() => {
  if (confirmationPopup.value == null) return

  confirmationPopup.value.focus()
})
onUnmounted(() => {
  if (confirmationPopup.value == null) return

  confirmationPopup.value.blur()
})

const message = computed(() => {
  if (props.isError) {
    const isCustomMessage =
      props.errorMessage === 'auth/wrong-password' ||
      props.errorMessage === 'auth/email-already-in-use' ||
      props.errorMessage === 'auth/user-not-found'
    return isCustomMessage
      ? 'The user name or password are incorrect'
      : 'Ooops, something went wrong. Try again later.'
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
  @apply focus-visible:outline-transparent;
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

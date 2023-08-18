<template>
  <div
    class="fixed bottom-6 right-8 sm:static"
    :class="{ 'sm:fixed': isDashboardEmpty }"
  >
    <Teleport to="body">
      <transition name="popup">
        <confirmation-popup v-if="isPopupShown" :isError="isAuthError" />
      </transition>
    </Teleport>
    <button
      @click="areUserOptionsShown = !areUserOptionsShown"
      ref="target"
      aria-label="Click here to see the user options"
      class="sm:relative rounded-md"
    >
      <user-icon />
    </button>
    <transition name="options">
      <div
        v-if="areUserOptionsShown"
        class="options-container w-[max-content] -top-9 right-0"
        :class="{
          'sm:-top-9 sm:right-0': isDashboardEmpty,
          'sm:top-[calc(100%+.5rem)] sm:right-1': !isDashboardEmpty
        }"
      >
        <button @click="logout" class="option">Log out</button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import UserIcon from './Svgs/UserIcon.vue'
import ConfirmationPopup from './shared/ConfirmationPopup.vue'
import { useUserStore } from '../stores/user'
import {
  isAuthError,
  isPopupShown,
  handleAuthResponse
} from '../composables/authHandler'
import { onClickOutside } from '@vueuse/core'
import { ref, Ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps<{
  isDashboardEmpty?: true
}>()

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const areUserOptionsShown = ref(false)

const logout = async () => {
  const response = await userStore.logout()

  if (response) {
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  handleAuthResponse(response, route.path)
}

const target = ref(null)
const closeUserOptions = (
  target: Ref<null | HTMLElement>,
  e: Event | KeyboardEvent
) => {
  if (
    (e.target as HTMLElement).closest('button') === target.value &&
    (e as KeyboardEvent).key !== 'Escape'
  )
    return

  if (target == null) return

  areUserOptionsShown.value = false
}
onClickOutside(target, (e: Event) => closeUserOptions(target, e))

onMounted(() => {
  window.addEventListener('keydown', (e: Event | KeyboardEvent) => {
    if ((e as KeyboardEvent).key === 'Escape') {
      closeUserOptions(target, e)
    }
  })
})
</script>

<style lang="postcss" scoped>
.options-enter-from,
.options-leave-to {
  @apply origin-bottom-right s:origin-top-right;
}
</style>

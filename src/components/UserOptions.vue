<template>
  <div
    class="absolute bottom-6 right-8 sm:static"
    :class="{ 'sm:fixed': isDashboardEmpty, 'sm:ml-3': !isDashboardEmpty }"
  >
    <Teleport to="body">
      <transition name="popup">
        <confirmation-popup
          v-if="isPopupShown"
          :isError="isAuthError"
          errorMessage="auth/wrong-password"
        />
      </transition>
    </Teleport>
    <Teleport to="body">
      <transition name="popup">
        <confirmation-modal
          v-if="isConfirmationModalShown"
          @close-modal="isConfirmationModalShown = false"
          elementToDelete="user"
          :isError="isAuthError"
        />
      </transition>
    </Teleport>
    <button
      @click="areUserOptionsShown = !areUserOptionsShown"
      ref="target"
      aria-label="Click here to see the user options"
      class="block sm:relative rounded-full outline-offset-3"
    >
      <user-icon :isDashboardEmpty="isDashboardEmpty" />
    </button>
    <transition name="options">
      <div
        v-if="areUserOptionsShown"
        class="options-container"
        :class="{
          '-top-16 right-0': isDashboardEmpty,
          'sm:top-[74px] sm:right-6': !isDashboardEmpty
        }"
      >
        <button @click="logout" class="option">Log out</button>
        <button
          @click="isConfirmationModalShown = true"
          class="option option--delete"
        >
          Delete account
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import UserIcon from './Svgs/UserIcon.vue'
import ConfirmationPopup from './shared/ConfirmationPopup.vue'
import ConfirmationModal from './Modals/ConfirmationModal.vue'
import { useUserStore } from '../stores/user'
import {
  isAuthError,
  isPopupShown,
  handleAuthResponse
} from '../composables/authHandler'
import { onClickOutside } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{
  isDashboardEmpty: boolean
}>()

const userStore = useUserStore()
const route = useRoute()

const areUserOptionsShown = ref(false)
const isConfirmationModalShown = ref(false)

const logout = async () => {
  const response = await userStore.logout()

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

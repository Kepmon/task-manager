<template>
  <div>
    <Teleport to="body">
      <transition name="popup">
        <confirmation-popup v-if="isPopupShown" :isError="isAuthError" />
      </transition>
    </Teleport>
    <user-icon @click="areUserOptionsShown = !areUserOptionsShown" />
    <transition name="options">
      <div
        v-if="areUserOptionsShown"
        ref="target"
        class="options-container -top-9 right-0 s:top-auto s:-bottom-7 s:right-6 overflow-hidden"
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
import { ref } from 'vue'

const userStore = useUserStore()
const areUserOptionsShown = ref(false)

const logout = async () => {
  const response = await userStore.logout()

  handleAuthResponse(response)
}

const target = ref(null)
onClickOutside(target, () => (areUserOptionsShown.value = false))
</script>

<style scoped>
.options-enter-from,
.options-leave-to {
  @apply origin-bottom-right s:origin-top-right;
}
</style>

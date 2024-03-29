<template>
  <div
    class="absolute bottom-6 right-8 sm:static z-10"
    :class="{ 'sm:fixed': isDashboardEmpty, 'sm:ml-3': !isDashboardEmpty }"
  >
    <Teleport to="body">
      <transition name="popup">
        <confirmation-modal
          v-if="isConfirmationModalShown"
          @close-modal="isConfirmationModalShown = false"
          elementToDelete="user"
        />
      </transition>
    </Teleport>
    <button
      @click="areUserOptionsShown = !areUserOptionsShown"
      ref="target"
      data-protected="user"
      aria-label="Click here to see the user options"
      aria-controls="more-options-auth"
      :aria-expanded="areUserOptionsShown ? true : false"
      class="block sm:relative rounded-full outline-offset-3"
    >
      <user-icon :isDashboardEmpty="isDashboardEmpty" />
    </button>
    <transition name="options">
      <more-options
        v-if="areUserOptionsShown"
        @toggle-options="(e: Event) => handleMoreOptionsFn(e, toggleOptions)"
        @handle-first-option-click="logout"
        @handle-second-option-click="isConfirmationModalShown = true"
        @close-more-options="(e: Event) => handleMoreOptionsFn(e, closeOptions)"
        element="auth"
        :isDashboardEmpty="isDashboardEmpty"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import UserIcon from './Svgs/UserIcon.vue'
import MoreOptions from './shared/MoreOptions.vue'
import ConfirmationModal from './Modals/ConfirmationModal.vue'
import toggleMoreOptions from '../composables/toggleMoreOptions'
import { useUserStore } from '../stores/user'
import { handleResponse } from '../composables/responseHandler'
import { ref } from 'vue'
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

  handleResponse(response, route.path)
}

const { toggleOptions, closeOptions } = toggleMoreOptions
const handleMoreOptionsFn = (
  e: Event,
  cb: (
    e: Event,
    conditionToChange: Ref<boolean>,
    protectedElement: string
  ) => void
) => {
  cb(e, areUserOptionsShown, 'user')
}
</script>

<style lang="postcss" scoped>
.options-enter-from,
.options-leave-to {
  @apply origin-bottom-right s:origin-top-right;
}
</style>

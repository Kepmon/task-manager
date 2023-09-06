<template>
  <div class="not-found-container">
    <h1 class="text-xxlFluid text-bold leading-snug">
      Ooops, the requested page has not been found!
    </h1>
    <p class="mx-auto w-[min(100%,500px)]">
      We,re sorry, it seems like the page you're looking for has been moved,
      deleted or might have not even exist.
    </p>
    <img
      class="mx-auto"
      src="/img/404-img.svg"
      alt="A nice picture displaying that this is the 404 situation"
    />

    <div class="flex justify-center gap-4">
      <button @click="goToHomePage" class="regular-button purple-class">
        Go To Home
      </button>
      <button @click="goToPreviousPage" class="regular-button white-button">
        Previous Page
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHomePage = () => {
  router.push({ name: 'login' })
}
const goToPreviousPage = () => {
  router.go(-1)
}
</script>

<style lang="postcss" scoped>
.not-found-container {
  @apply grid place-content-center gap-12 mx-auto py-4 min-h-screen w-[min(90%,1200px)];
  @apply text-center text-baseFluid;
}

.regular-button {
  @apply w-max grow-0;
}
</style>

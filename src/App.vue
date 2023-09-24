<template>
  <router-view v-slot="{ Component }">
    <transition name="pages" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useDark } from '@vueuse/core'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isDark = useDark()
</script>

<template>
  <div class="flex items-center justify-center gap-x-6 mx-auto h-12">
    <img src="/img/icon-light-theme.svg" alt="" />
    <button
      @click="() => toggleDark()"
      :regularButton="false"
      :aria-label="`Click here to switch the theme from ${
        isDark ? 'dark' : 'light'
      } to ${isDark ? 'light' : 'dark'}`"
      class="toggle-theme purple-class"
    >
      <transition-group name="theme-toggle">
        <div
          key="theme-toggle"
          class="w-[14px] h-[14px] bg-white rounded-full"
          :class="{ 'ml-auto': isDark }"
        ></div>
      </transition-group>
    </button>
    <img src="/img/icon-dark-theme.svg" alt="" />
  </div>
</template>

<script setup lang="ts">
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<style lang="postcss" scoped>
.theme-toggle-move {
  @apply transition-all duration-300;
}

.toggle-theme {
  @apply flex items-center px-1 w-[40px] h-[20px] rounded-xl;
}
</style>

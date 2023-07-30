<template>
  <div class="lds-roller">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style lang="postcss" scoped>
.lds-roller {
  @apply absolute inset-0 m-auto w-20 aspect-square;
}
.lds-roller div {
  @apply origin-40 after:block after:absolute after:w-[7px] after:aspect-square;
  @apply after:rounded-full after:bg-white;
}
.lds-roller div:nth-child(1) {
  @apply animate-lds-roller-1 after:top-[63px] after:left-[63px];
}
.lds-roller div:nth-child(2) {
  @apply animate-lds-roller-2 after:top-[68px] after:left-[58px];
}
.lds-roller div:nth-child(3) {
  @apply animate-lds-roller-3 after:top-[71px] after:left-[48px];
}
.lds-roller div:nth-child(4) {
  @apply animate-lds-roller-4 after:top-[72px] after:left-[40px];
}
.lds-roller div:nth-child(5) {
  @apply animate-lds-roller-5 after:top-[71px] after:left-[32px];
}
.lds-roller div:nth-child(6) {
  @apply animate-lds-roller-6 after:top-[68px] after:left-[24px];
}
.lds-roller div:nth-child(7) {
  @apply animate-lds-roller-7 after:top-[63px] after:left-[17px];
}
.lds-roller div:nth-child(8) {
  @apply animate-lds-roller-8 after:top-[56px] after:left-[12px];
}
</style>

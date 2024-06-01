<template>
  <main>
    <slot />
  </main>
</template>
<style lang="scss">
main {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

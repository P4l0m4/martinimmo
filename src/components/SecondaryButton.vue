<script setup lang="ts">
defineProps<{
  buttonState?: "success" | "error" | "loading" | "default";
  buttonType?: "light" | "dark";
}>();
</script>
<template>
  <button
    v-if="buttonType === 'dark'"
    class="button secondary--dark scale-on-hover"
    :class="buttonState"
  >
    <slot></slot>
    <IconComponent
      v-if="buttonState === 'loading'"
      :icon="`loader`"
      color="#9600de"
    />
    <IconComponent
      v-if="buttonState === 'success'"
      :icon="`check-circle`"
      color="#00a86b"
    />
    <IconComponent
      v-if="buttonState === 'error'"
      :icon="`x-circle`"
      color="#bb0025"
    />
  </button>
  <button
    v-else
    class="button secondary--light scale-on-hover"
    :class="buttonState"
  >
    <slot></slot>
    <IconComponent
      v-if="buttonState === 'loading'"
      :icon="`loader`"
      color="#fffdfa"
    />
    <IconComponent
      v-if="buttonState === 'success'"
      :icon="`check-circle`"
      color="#fffdfa"
    />
    <IconComponent
      v-if="buttonState === 'error'"
      :icon="`x-circle`"
      color="#fffdfa"
    />
  </button>
</template>
<style scoped lang="scss">
.button {
  &.success {
    box-shadow: $shadow-success;
    background-color: transparent;
    border-color: $success-color;
    color: $success-color;
  }
  &.error {
    box-shadow: $shadow-error;
    background-color: transparent;
    border-color: $error-color;
    color: $error-color;
  }
  &.loading {
    box-shadow: $shadow-loading;
    background-color: transparent;
    border-color: $loading-color;
    color: $loading-color;
  }
}
</style>

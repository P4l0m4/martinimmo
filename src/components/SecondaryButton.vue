<script setup lang="ts">
defineProps({
  buttonState: "success" | "error" | "loading",
  buttonType: "light" | "dark",
});
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
  &.secondary--dark {
    box-shadow: $shadow-secondary;
    background-color: transparent;
    border-color: $secondary-color;
    color: $secondary-color;
  }
  &.secondary--light {
    box-shadow: $shadow-primary;
    background-color: transparent;
    border-color: $primary-color;
    color: $text-color-alt;
  }
  &.success {
    box-shadow: $shadow-success;
    background-color: transparent;
    border-color: $success-color;
    color: $text-color-alt;
  }
  &.error {
    box-shadow: $shadow-error;
    background-color: transparent;
    border-color: $error-color;
    color: $text-color-alt;
  }
  &.loading {
    box-shadow: $shadow-loading;
    background-color: transparent;
    border-color: $loading-color;
    color: $text-color-alt;
  }
}
</style>

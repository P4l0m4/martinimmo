<script setup lang="ts">
defineProps<{
  buttonState?: "success" | "error" | "loading";
  buttonType?: "light" | "dark";
}>();
</script>
<template>
  <button
    v-if="buttonType === 'dark'"
    class="button primary--dark scale-on-hover"
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
    class="button primary--light scale-on-hover"
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
    background-color: $success-color;
    border-color: $success-color;
    color: $text-color-alt;
  }
  &.error {
    box-shadow: $shadow-error;
    background-color: $error-color;
    border-color: $error-color;
    color: $text-color-alt;
  }
  &.loading {
    box-shadow: $shadow-loading;
    background-color: $loading-color;
    border-color: $loading-color;
    color: $text-color-alt;
  }
}
</style>

<script setup lang="ts">
defineProps<{
  email: String;
  name: String;
}>();

function copyEmailToClipboard(email: string) {
  navigator.clipboard.writeText(email);
}
</script>
<template>
  <Transition>
    <div class="family-member" @click="copyEmailToClipboard(email as string)">
      <span>{{ name }}</span>
      <span class="family-member__email"
        ><IconComponent icon="mail" />{{ email }}</span
      >
    </div></Transition
  >
</template>
<style lang="scss" scoped>
.family-member {
  display: flex;
  flex-direction: column;
  background-color: $primary-color;
  box-shadow: $shadow-black;
  padding: 1rem;
  border-radius: $radius;

  &__email {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>

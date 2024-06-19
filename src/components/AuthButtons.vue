<script setup lang="ts">
import { useToggle } from "@vueuse/core";

const [showSignUp, toggleSignUp] = useToggle();
const [showSignIn, toggleSignIn] = useToggle();
</script>
<template>
  <div class="buttons">
    <button class="button--tertiary-dark" @click="toggleSignIn">
      Connexion
    </button>
    <SecondaryButton button-type="dark" @click="toggleSignUp"
      >Inscription</SecondaryButton
    >
    <SignUp v-if="showSignUp" @close-sign-up="showSignUp = !showSignUp" />
    <SignIn v-if="showSignIn" @close-sign-in="showSignIn = !showSignIn" />
  </div>
</template>
<style lang="scss" scoped>
.buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 350px;
  margin-left: auto;
}
</style>

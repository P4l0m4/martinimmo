<script setup lang="ts">
import { useToggle } from "@vueuse/core";

const [showSignUp, toggleSignUp] = useToggle();
const [showSignIn, toggleSignIn] = useToggle();
</script>
<template>
  <Container class="centered-content" style="height: calc(100dvh - 70px)">
    <h1 class="titles">
      Ils ont des <span class="secondary-color">biens à vendre</span>,
      trouvez-les en un clic 🖱️
    </h1>
    <div class="buttons">
      <SecondaryButton button-type="dark" @click="toggleSignIn"
        >Connexion</SecondaryButton
      >
      <PrimaryButton button-type="dark" @click="toggleSignUp"
        >Inscription</PrimaryButton
      >

      <SignUp v-if="showSignUp" @close-sign-up="showSignUp = !showSignUp" />
      <SignIn
        v-if="showSignIn"
        @close-sign-in="showSignIn = !showSignIn"
      /></div
  ></Container>
</template>
<style lang="scss" scoped>
.titles {
  max-width: 1000px;
  text-align: center;
  text-wrap: balance;
}
.buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 450px;
}
</style>

<script setup lang="ts">
import { useToggle } from "@vueuse/core";

const [showSignUp, toggleSignUp] = useToggle();
const [showSignIn, toggleSignIn] = useToggle();

const [showPasswordReset, togglePasswordReset] = useToggle();

function closeAndDisplayPasswordReset() {
  toggleSignIn();
  togglePasswordReset();
}
</script>
<template>
  <Container class="centered-content" style="min-height: calc(100dvh - 72px)">
    <h1 class="titles">
      Ils ont des <span class="secondary-color">biens à vendre</span>,
      trouvez-les en un clic 🖱️
    </h1>
    <h2>
      Accédez à un répertoire de plus de
      <span class="secondary-color">2 millions de contacts qualifiés</span>
      partout en France
    </h2>

    <div class="buttons">
      <SecondaryButton button-type="dark" @click="toggleSignIn"
        >Connexion</SecondaryButton
      >
      <PrimaryButton button-type="dark" @click="toggleSignUp"
        >Inscription</PrimaryButton
      >

      <SignUp
        v-if="showSignUp"
        @close-sign-up="showSignUp = !showSignUp"
        @close-password-reset="togglePasswordReset, toggleSignUp"
      />
      <SignIn
        v-if="showSignIn"
        @close-sign-in="showSignIn = !showSignIn"
        @close-password-reset="closeAndDisplayPasswordReset"
      />
    </div>

    <PasswordReset v-if="showPasswordReset" @email-sent="togglePasswordReset"
  /></Container>
</template>
<style lang="scss" scoped>
.titles {
  margin-top: -72px;
  max-width: 1000px;
  text-wrap: balance;

  @media (min-width: $big-tablet-screen) {
    text-align: center;
  }
}
.buttons {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 450px;
  flex-direction: column;

  @media (min-width: $big-tablet-screen) {
    flex-direction: row;
  }
}
</style>

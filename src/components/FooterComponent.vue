<script setup lang="ts">
import { useToggle } from "@vueuse/core";

const [showSignUp, toggleSignUp] = useToggle();
const [showSignIn, toggleSignIn] = useToggle();
</script>
<template>
  <footer>
    <ul class="links">
      <li class="links__li"><NuxtLink to="/">Accueil</NuxtLink></li>
      <li class="links__li"><NuxtLink to="/recherche">Recherche</NuxtLink></li>
      <li class="links__li">
        <NuxtLink to="/mon-compte">Mon compte</NuxtLink>
      </li>
    </ul>
    <ul class="links">
      <li class="links__li">
        <NuxtLink to="tekilawebfactory.com"
          >Made By Tekila Web Factory</NuxtLink
        >
      </li>
      <li class="links__li">
        <button class="button--tertiary-light">Mentions légales</button>
      </li>
      <PrimaryButton button-type="light" @click="toggleSignUp"
        >Inscription</PrimaryButton
      >
      <SecondaryButton button-type="light" @click="toggleSignIn"
        >Connexion</SecondaryButton
      >

      <SignUp v-if="showSignUp" @close-sign-up="showSignUp = !showSignUp" />
      <SignIn v-if="showSignIn" @close-sign-in="showSignIn = !showSignIn" />
    </ul>
  </footer>
</template>
<style lang="scss" scoped>
footer {
  background-color: $secondary-color;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: $big-tablet-screen) {
    flex-direction: row;
    padding: 2rem;
    gap: 4rem;
  }

  .links {
    display: flex;
    gap: 1rem;
    list-style: none;
    flex-direction: column;

    &__li {
      a {
        color: $text-color-alt;
      }
    }
  }
}
</style>

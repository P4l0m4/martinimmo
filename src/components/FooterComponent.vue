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
  <footer>
    <GridContainer>
      <div class="first-box">
        <div class="title-section">
          <img
            class="title-section__logo"
            src="@/assets/images/immo-logo.svg"
            alt="logo martinimmo"
          />
          <h4 class="title-section__title">Martinimmo</h4>
        </div>
        <p class="paragraphs">
          Facilitez votre recherche de biens à vendre. Accédez à plus de 2
          millions de profils qualifiés.
        </p>
      </div>
      <ul class="links">
        <h5 class="links__title">Liens utiles</h5>
        <li class="links__li"><NuxtLink to="/">Accueil</NuxtLink></li>
        <li class="links__li">
          <NuxtLink to="/recherche">Recherche</NuxtLink>
        </li>
        <li class="links__li">
          <NuxtLink to="/mon-compte">Mon compte</NuxtLink>
        </li>
        <li class="links__li">
          <NuxtLink to="/faq">FAQ</NuxtLink>
        </li>
      </ul>
      <ul class="links">
        <h5 class="links__title">A propos</h5>
        <li class="links__li">
          <NuxtLink to="tekilawebfactory.com"
            >Made By Tekila Web Factory</NuxtLink
          >
        </li>
        <li class="links__li">508 rue Pichat</li>
        <li class="links__li">73800, Ste-Hélène-du-Lac</li>
      </ul>
      <div class="buttons">
        <PrimaryButton button-type="light" @click="toggleSignUp"
          >Inscription</PrimaryButton
        >
        <SecondaryButton button-type="light" @click="toggleSignIn"
          >Connexion</SecondaryButton
        >

        <SignUp v-if="showSignUp" @close-sign-up="showSignUp = !showSignUp" />
        <SignIn
          v-if="showSignIn"
          @close-sign-in="showSignIn = !showSignIn"
          @close-password-reset="closeAndDisplayPasswordReset"
        />
        <PasswordReset
          v-if="showPasswordReset"
          @email-sent="togglePasswordReset"
        />
      </div>
    </GridContainer>

    <div class="bottom-links">
      <NuxtLink
        to="https://docs.google.com/document/d/e/2PACX-1vQW80YJ6C8B_FY9LEPW6j4pEz3IfThZ-StWlcqUTakTnIUuAxn7CcheVopddu5dpgjlal_Amibhh2GF/pub"
        target="_blank"
        >CGV</NuxtLink
      ><NuxtLink
        to="https://docs.google.com/document/d/e/2PACX-1vTOGTdv866qLzIX4H8alMu0WlN-CeYjKNgtsEIJiimH1npT3ypGF3KCcu3eN0h9zmYpVWgK8wzcQqyi/pub"
        target="_blank"
        >CGU</NuxtLink
      ><NuxtLink
        to="https://docs.google.com/document/d/e/2PACX-1vRl0b5T5OmciZCyENe13NQgpoZH2g7YlzJUzgwiQwjbwLoOAvtbgrQDE-xVRqncwj8pHzeM8XxDEvMF/pub"
        target="_blank"
        >RGPD</NuxtLink
      >
      <NuxtLink to="tekilawebfactory.com" target="_blank"
        >Mentions légales</NuxtLink
      >
      <NuxtLink to="tekilawebfactory.com">©Tekila Web Factory 2025</NuxtLink>
    </div>
  </footer>
</template>
<style lang="scss" scoped>
footer {
  background-color: $secondary-color;
  padding: 1rem;
  gap: 2rem;
  display: flex;
  flex-direction: column;

  .first-box {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: $text-color-alt;

    .title-section {
      display: flex;
      gap: 0.5rem;
      height: fit-content;
      align-items: center;

      &__logo {
        width: 40px;
        height: 40px;
      }

      &__title {
        color: $text-color-alt;
        font-size: $titles;
      }
    }
  }

  .links {
    display: flex;
    gap: 1rem;
    list-style: none;
    flex-direction: column;

    &__title {
      color: $text-color-alt;
      font-size: $subtitles;
    }

    &__li {
      color: $text-color-alt;
      a {
        color: $text-color-alt;
      }
    }
  }

  .buttons {
    display: flex;
    gap: 1rem;
    height: fit-content;
    flex-direction: column;

    @media (min-width: $big-tablet-screen) {
      flex-direction: row;
    }
  }

  .bottom-links {
    display: flex;
    gap: 1rem;
    color: $primary-color-faded;
    font-size: $small-text;
    border-top: 1px solid $primary-color-faded;
    width: 100%;
    padding-top: 2rem;
    margin-left: 2rem;

    & a {
      color: $primary-color-faded;
      white-space: nowrap;
    }
  }
}
</style>

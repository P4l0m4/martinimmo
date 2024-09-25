<script setup lang="ts">
import { useToggle } from "@vueuse/core";

const [showSignUp, toggleSignUp] = useToggle();
const [showSignIn, toggleSignIn] = useToggle();
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
          millions de contacts qualifiés.
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
        <SignIn v-if="showSignIn" @close-sign-in="showSignIn = !showSignIn" />
      </div>
    </GridContainer>

    <div class="bottom-links">
      <NuxtLink to="tekilawebfactory.com">CGV</NuxtLink
      ><NuxtLink to="tekilawebfactory.com">RGPD</NuxtLink
      ><NuxtLink to="tekilawebfactory.com">Mentions légales</NuxtLink>
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

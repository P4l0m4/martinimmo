<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isHome = ref(true);

const [showSignUp, toggleSignUp] = useToggle();
const [showSignIn, toggleSignIn] = useToggle();

const [showPasswordReset, togglePasswordReset] = useToggle();

const message = ref("à vendre");
const messages = ["à vendre", "à débarasser", "à nettoyer"];
let intervalId: any;
function changeMessage() {
  let index = messages.indexOf(message.value);
  intervalId = setInterval(() => {
    if (index === messages.length) index = 0;
    message.value = messages[index++];
  }, 2000);
}

function closeAndDisplayPasswordReset() {
  toggleSignIn();
  togglePasswordReset();
}

onMounted(() => {
  changeMessage();

  if (route.path === "/") {
    isHome.value = true;
  } else {
    isHome.value = false;
  }
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
<template>
  <Container class="centered-content" style="min-height: calc(100dvh - 72px)">
    <h1 class="titles" :class="{ 'base-color': isHome }">
      Ils ont des biens
      <span
        :class="{ 'secondary-color-alt': isHome, 'secondary-color': !isHome }"
        >{{ message }}</span
      >, trouvez-les en un clic 🖱️
    </h1>
    <h2 :class="{ 'base-color': isHome }" class="subtitles">
      Plus de
      <span
        :class="{ 'secondary-color-alt': isHome, 'secondary-color': !isHome }"
        >2 millions
      </span>
      de profils qualifiés partout en France
    </h2>

    <div class="buttons" v-if="isHome">
      <SecondaryButton button-type="light" @click="toggleSignIn"
        >Connexion</SecondaryButton
      >
      <PrimaryButton button-type="light" @click="toggleSignUp"
        >Inscription</PrimaryButton
      >
    </div>
    <div class="buttons" v-else>
      <SecondaryButton button-type="dark" @click="toggleSignIn"
        >Connexion</SecondaryButton
      >
      <PrimaryButton button-type="dark" @click="toggleSignUp"
        >Inscription</PrimaryButton
      >
    </div>

    <SignUp
      v-if="showSignUp"
      @close-sign-up="showSignUp = !showSignUp"
      @close-password-reset="togglePasswordReset, toggleSignUp" />
    <SignIn
      v-if="showSignIn"
      @close-sign-in="showSignIn = !showSignIn"
      @close-password-reset="closeAndDisplayPasswordReset" />

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

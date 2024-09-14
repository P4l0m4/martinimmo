<script setup lang="ts">
import { onMounted } from "vue";
import { useToggle } from "@vueuse/core";
import { generateUser } from "@/utils/supabase";

const [showSignIn, toggleSignIn] = useToggle();

onMounted(async () => {
  await generateUser();
});
</script>
<template>
  <Container class="centered-content">
    <h1 class="titles">Bienvenue !</h1>
    <p class="paragraphs">
      Vous pouvez maintenant vous connecter avec votre email et votre mot de
      passe.
    </p>
    <PrimaryButton button-type="dark" @click="toggleSignIn"
      >Connexion</PrimaryButton
    ></Container
  ><SignIn v-if="showSignIn" @close-sign-in="showSignIn = !showSignIn" />
</template>

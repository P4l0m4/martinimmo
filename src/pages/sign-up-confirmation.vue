<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { checkExistingToken, addUser, fetchUserById } from "@/utils/supabase";
import { useAccountStore } from "@/stores/accountStore";
import { updateUser } from "@/utils/supabase";

const accountStore = useAccountStore();

const [showSignIn, toggleSignIn] = useToggle();

const isUserLoggedIn = ref();
isUserLoggedIn.value = await checkExistingToken();

const currentDate = new Date();
const dateISOString = currentDate.toISOString();
let user = ref();
onMounted(async () => {
  if (isUserLoggedIn.value.user) {
    addUser(isUserLoggedIn.value.user.id, dateISOString);
    user.value = await fetchUserById(isUserLoggedIn.value.user.id);
    accountStore.updateLastCreditUpdate(user.value.last_credit_update);
    // updateUser(isUserLoggedIn.value.user.id, accountStore.credits);
  }
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

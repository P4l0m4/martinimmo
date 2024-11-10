<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  updateUserPassword,
  signOut,
  checkExistingToken,
} from "@/utils/supabase";

const router = useRouter();
const newPassword = ref("");
const mail = "paloma";
const buttonState = ref<"default" | "success" | "error" | "loading">("default");
const resetPassword = async () => {
  const { success } = await updateUserPassword(mail, newPassword.value);

  if (success) {
    alert("Mot de passe mis à jour avec succès");
    await signOut();
    router.push("/mon-compte");
  } else {
    alert("Erreur");
  }
};
let isUserLoggedIn = await checkExistingToken();
</script>

<template>
  <Container>
    {{ isUserLoggedIn }}
    <h2>Votre nouveau mot de passe</h2>
    <p>{{ mail }}</p>
    <form class="form" @submit.prevent="resetPassword">
      <InputField
        type="password"
        v-model="newPassword"
        name="new-password"
        id="new-password"
        placeholder="!Vq0h2@8RHi"
        label="Nouveau mot de passe"
        required
      />

      <PrimaryButton
        button-type="dark"
        :button-state="buttonState"
        type="submit"
      >
        Update Password
      </PrimaryButton>
    </form>
  </Container>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

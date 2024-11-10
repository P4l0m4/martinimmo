<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import {
  updateUserPassword,
  signOut,
  createTempSession,
  checkSession,
} from "@/utils/supabase";

const route = useRoute();
const newPassword = ref("");
// const mail = route.query.email as string;
const mail = "palomatejeda81@gmail.com";
const resetPassword = async () => {
  const { success, error } = await updateUserPassword(mail, newPassword.value);

  if (success) {
    alert("Mot de passe mis à jour avec succès");
    // await signOut(); // Déconnectez l'utilisateur après la mise à jour
    // router.push("/mon-compte"); // Rediriger vers la page de connexion ou compte
  } else {
    alert("Erreur: " + error);
  }
};
</script>

<template>
  <Container>
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

      <button type="submit" class="button primary--dark">
        Update Password
      </button>
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

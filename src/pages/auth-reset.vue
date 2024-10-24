<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { updateUserPassword, signOut } from "@/utils/supabase";

const route = useRoute();
const router = useRouter();
const newPassword = ref("");

const resetPassword = async () => {
  console.log("Route query parameters:", route.query);
  const token = route.query.token as string;

  if (!token) {
    alert("Invalid or expired reset token.");
    return;
  }

  const { success, error } = await updateUserPassword(newPassword.value);

  if (success) {
    alert("Mot de passe mis à jour avec succès");
    await signOut(); // Déconnectez l'utilisateur après la mise à jour
    console.log("User signed out");
    router.push("/mon-compte"); // Rediriger vers la page de connexion ou compte
  } else {
    alert("Erreur: " + error);
  }
};
</script>

<template>
  <Container>
    <h2>Renseignez votre nouveau mot de passe</h2>
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
      <p v-if="newPassword">{{ newPassword }}</p>
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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { updateUserPassword } from "@/utils/supabase";

const route = useRoute();
const router = useRouter();
const newPassword = ref("");

const resetPassword = async () => {
  const token = route.query.token as string; // Correctly extract the token
  console.log("Extracted token:", token);

  if (!token) {
    alert("Invalid or expired reset token.");
    return;
  }

  const { success, error } = await updateUserPassword(token, newPassword.value);

  if (success) {
    alert("Mot de passe mis à jour avec succès");
    router.push("/mon-compte");
  } else {
    alert("Erreur: " + error);
  }
};

onMounted(() => {
  console.log("Route query parameters:", route.query);
});
</script>

<template>
  <Container>
    <h2>Renseignez votre nouveau mot de passe</h2>
    <form class="form" @submit.prevent="resetPassword">
      <InputField
        type="password"
        v-model="newPassword"
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

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { updateUserPassword } from "@/utils/supabase";

const route = useRoute();
const router = useRouter();
const newPassword = ref("");

const resetPassword = async () => {
  const accessToken = route.query.access_token;
  if (!accessToken) {
    alert("Invalid or expired reset token.");
    return;
  }

  const { success, error } = await updateUserPassword(
    accessToken,
    newPassword.value
  );

  if (success) {
    alert("Password updated successfully!");
    router.push("/mon-compte");
  } else {
    alert("Error updating password: " + error);
  }
};
</script>

<template>
  <div>
    <h2>Reset Password</h2>
    <form @submit.prevent="resetPassword">
      <InputField
        type="password"
        v-model="newPassword"
        placeholder="Nouveau mot de passe"
        required
      />
      <button type="submit" class="button primary--dark">
        Update Password
      </button>
    </form>
  </div>
</template>

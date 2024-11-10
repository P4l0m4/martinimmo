<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { updateUserPassword, checkExistingToken } from "@/utils/supabase";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

const router = useRouter();

const isUserLoggedIn = await checkExistingToken();
const mail = isUserLoggedIn.user.email;

const newPassword = ref("");

const buttonState = ref<"default" | "success" | "error" | "loading">("default");
const buttonLabel = computed(() => {
  if (passwordErrors.value.length > 0) {
    return passwordErrors.value[0];
  } else {
    return "Mettre à jour";
  }
});
const uppercaseRegex = /[A-Z]/;
const hasUpperCase = (value: string) => uppercaseRegex.test(value);

const lowercaseRegex = /[a-z]/;
const hasLowerCase = (value: string) => lowercaseRegex.test(value);

const numberRegex = /[0-9]/;
const hasNumber = (value: string) => numberRegex.test(value);

const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
const hasSpecialChar = (value: string) => specialCharRegex.test(value);

const passwordComplexity = {
  required,
  minLength: minLength(8),
  hasUpperCase,
  hasLowerCase,
  hasNumber,
  hasSpecialChar,
};
const rules = {
  password: passwordComplexity,
};
const state = {
  password: newPassword.value,
};

const v$ = useVuelidate(rules, state);
const passwordErrors = computed(() => {
  const errors: string[] = [];
  if (!v$.value.password.$dirty) return errors;
  if (v$.value.password.required.$invalid) {
    errors.push("Mot de passe vide");
  }
  if (v$.value.password.minLength.$invalid) {
    errors.push("Au moins 8 caractères");
  }
  if (v$.value.password.hasUpperCase.$invalid) {
    errors.push("Au moins une majuscule");
  }
  if (v$.value.password.hasLowerCase.$invalid) {
    errors.push("Au moins une minuscule");
  }
  if (v$.value.password.hasNumber.$invalid) {
    errors.push("Au moins un chiffre");
  }
  if (v$.value.password.hasSpecialChar.$invalid) {
    errors.push("Au moins un caractère spécial");
  }
  return errors;
});

const resetPassword = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) {
    buttonState.value = "error";
    return;
  }
  const { success } = await updateUserPassword(mail, newPassword.value);

  if (success) {
    buttonState.value = "success";
    alert("Mot de passe mis à jour avec succès");
    router.push("/mon-compte");
  } else {
    alert("Erreur");
  }
};
</script>

<template>
  <Container>
    <h2>Votre nouveau mot de passe</h2>
    <form class="form" @submit.prevent="resetPassword">
      <InputField
        type="password"
        v-model="newPassword"
        name="new-password"
        id="new-password"
        placeholder="!Vq0h2@8RHi"
        label="Nouveau mot de passe"
        required
        :error="passwordErrors[0]"
      />

      <PrimaryButton
        button-type="dark"
        :button-state="buttonState"
        type="submit"
      >
        {{ buttonLabel }}
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

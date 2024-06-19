<script setup lang="ts">
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import { authenticateUser } from "@/utils/supabase";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";

const isSubmitting = ref("default");
const emailRef = ref("");
const passwordRef = ref("");
const target = ref<HTMLElement | null>(null);
const invalidCredentialsMessage = ref(null as string | null);
const emit = defineEmits(["closeSignIn"]);

onClickOutside(target, () => emit("closeSignIn"));

const rules = {
  email: { required, email },
  password: { required },
};

const state = {
  email: emailRef,
  password: passwordRef,
};

const v$ = useVuelidate(rules, state);

function confirmSubmission() {
  isSubmitting.value = "success";
  v$.value.$reset();
  emailRef.value = "";
  passwordRef.value = "";
  invalidCredentialsMessage.value = null;

  setTimeout(() => {
    isSubmitting.value = "default";
    emit("closeSignIn");
  }, 2000);
}

const emailErrors = computed(() => {
  const errors: string[] = [];
  if (!v$.value.email.$dirty) return errors;
  if (v$.value.email.required.$invalid) {
    errors.push("Email vide");
  }
  if (v$.value.email.email.$invalid) {
    errors.push("Adresse mail invalide");
  }
  return errors;
});

const passwordErrors = computed(() => {
  const errors: string[] = [];
  if (!v$.value.password.$dirty) return errors;
  if (v$.value.password.required.$invalid) {
    errors.push("Mot de passe vide");
  }

  return errors;
});

async function submitForm() {
  isSubmitting.value = "loading";
  v$.value.$touch();
  if (v$.value.$invalid) {
    isSubmitting.value = "error";
    return;
  }
  try {
    await authenticateUser(emailRef.value, passwordRef.value);
    invalidCredentialsMessage.value = "Vous êtes connecté";
    confirmSubmission();
  } catch (error) {
    invalidCredentialsMessage.value = "Ce compte n'existe pas";
    setTimeout(() => {
      invalidCredentialsMessage.value = null;
    }, 1000);
    console.error("Failed to log in", error);
    isSubmitting.value = "error";
  }
}

const buttonLabel = computed(() => {
  if (isSubmitting.value === "default") return "Me connecter";
  else if (isSubmitting.value === "loading") return "Me connecter";
  else if (isSubmitting.value === "success") return "Vous êtes connecté";
  else if (isSubmitting.value === "error")
    return (
      emailErrors.value[0] ||
      passwordErrors.value[0] ||
      invalidCredentialsMessage.value ||
      "Me connecter"
    );
});

const buttonState = computed(() => {
  if (isSubmitting.value === "default") return "default";
  else if (isSubmitting.value === "loading") return "loading";
  else if (isSubmitting.value === "success") return "success";
  else if (
    isSubmitting.value === "error" &&
    !invalidCredentialsMessage.value &&
    !emailErrors.value[0] &&
    !passwordErrors.value[0]
  )
    return "default";
  else if (
    isSubmitting.value === "error" &&
    (emailErrors.value[0] ||
      invalidCredentialsMessage.value !== null ||
      passwordErrors.value[0])
  )
    return "error";
  else if (isSubmitting.value === "error") return "error";
});
</script>

<template>
  <section class="sign-up">
    <form class="sign-up__form" ref="target" @submit.prevent="submitForm">
      <InputField
        v-model="emailRef"
        id="email"
        label="Email"
        type="text"
        placeholder="example@gmail.com"
        icon="mail"
        name="email"
        :error="emailErrors[0]"
      />
      <InputField
        v-model="passwordRef"
        id="password"
        label="Mot de passe"
        type="text"
        placeholder="Ax1fy9@kzV3"
        icon="key"
        name="password"
        :error="passwordErrors[0]"
      />

      <PrimaryButton
        button-type="dark"
        type="submit"
        :button-state="buttonState"
      >
        {{ buttonLabel }}
      </PrimaryButton>
    </form>
  </section>
</template>
<style lang="scss" scoped>
.sign-up {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  width: 100vw;
  background-color: $secondary-color-faded;
  backdrop-filter: blur(4px);
  padding: 1rem;
  z-index: 1;

  &__form {
    max-width: 400px;
    width: fit-content;
    padding: 1rem;
    border-radius: $radius;
    box-shadow: $shadow-secondary;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: $base-color;

    &__wrapper {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: $small-text;
    }
  }
}
</style>

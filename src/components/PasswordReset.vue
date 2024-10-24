<script setup lang="ts">
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import { sendPasswordResetEmail } from "@/utils/supabase";

const isSubmitting = ref("default");
const emailRef = ref("");
const target = ref<HTMLElement | null>(null);
const invalidCredentialsMessage = ref(null as string | null);

const emit = defineEmits(["emailSent"]);

onClickOutside(target, () => emit("emailSent"));

const rules = {
  email: { required, email },
};

const state = {
  email: emailRef,
};

const v$ = useVuelidate(rules, state);

function confirmSubmission() {
  isSubmitting.value = "success";
  v$.value.$reset();
  emailRef.value = "";
  invalidCredentialsMessage.value = null;

  setTimeout(() => {
    isSubmitting.value = "default";
    emit("emailSent");
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

async function submitForm() {
  isSubmitting.value = "loading";
  v$.value.$touch();
  if (v$.value.$invalid) {
    isSubmitting.value = "error";
    return;
  }
  try {
    await sendPasswordResetEmail(emailRef.value);

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
  if (isSubmitting.value === "default") return "Réinitialiser mon mot de passe";
  else if (isSubmitting.value === "loading")
    return "Réinitialiser mon mot de passe";
  else if (isSubmitting.value === "success") return "Lien envoyé par mail";
  else if (isSubmitting.value === "error")
    return (
      emailErrors.value[0] ||
      invalidCredentialsMessage.value ||
      "Réinitialiser mon mot de passe"
    );
});

const buttonState = computed(() => {
  if (isSubmitting.value === "default") return "default";
  else if (isSubmitting.value === "loading") return "loading";
  else if (isSubmitting.value === "success") return "success";
  else if (
    isSubmitting.value === "error" &&
    !invalidCredentialsMessage.value &&
    !emailErrors.value[0]
  )
    return "default";
  else if (
    isSubmitting.value === "error" &&
    (emailErrors.value[0] || invalidCredentialsMessage.value !== null)
  )
    return "error";
  else if (isSubmitting.value === "error") return "error";
});
</script>

<template>
  <section class="password-reset">
    <form
      class="password-reset__form"
      ref="target"
      @submit.prevent="submitForm"
    >
      <InputField
        v-model="emailRef"
        id="email"
        label="Email"
        type="text"
        placeholder="example@gmail.com"
        icon="mail"
        name="email"
        :error="emailErrors[0]"
        aurofocus="true"
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
.password-reset {
  z-index: 2;
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

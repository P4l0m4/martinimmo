<script setup lang="ts">
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import { sendInvitation } from "@/utils/supabase";
import { useVuelidate } from "@vuelidate/core";
import { required, email, sameAs, minLength } from "@vuelidate/validators";

const isSubmitting = ref("default");
const emailRef = ref("");
const passwordRef = ref("");
const termsRef = ref(false);
const target = ref<HTMLElement | null>(null);
const emit = defineEmits(["closeSignUp"]);

onClickOutside(target, () => emit("closeSignUp"));

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
  email: { required, email },
  password: passwordComplexity,
  terms: { sameAs: sameAs(true) },
};

const state = {
  email: emailRef,
  password: passwordRef,
  terms: termsRef,
};

const v$ = useVuelidate(rules, state);

function confirmSubmission() {
  isSubmitting.value = "success";

  v$.value.$reset();
  emailRef.value = "";
  passwordRef.value = "";
  termsRef.value = false;

  setTimeout(() => {
    isSubmitting.value = "default";
    emit("closeSignUp");
  }, 4000);
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

const termsErrors = computed(() => {
  const errors: string[] = [];
  if (!v$.value.terms.$dirty) return errors;
  if (v$.value.terms.sameAs.$invalid) {
    errors.push("Acceptez les conditions d'utilisation");
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
    await sendInvitation(emailRef.value, passwordRef.value, "gratuit");
    confirmSubmission();
  } catch (error) {
    console.error("Failed to send invitation", error);
    isSubmitting.value = "error";
  }
}

const buttonLabel = computed(() => {
  if (isSubmitting.value === "default") return "Créer mon compte";
  else if (isSubmitting.value === "loading") return "Créer mon compte";
  else if (isSubmitting.value === "success") return "Invitation envoyée";
  else if (isSubmitting.value === "error")
    return (
      emailErrors.value[0] ||
      termsErrors.value[0] ||
      passwordErrors.value[0] ||
      "Créer mon compte"
    );
});

const buttonState = computed(() => {
  if (isSubmitting.value === "default") return "default";
  else if (isSubmitting.value === "loading") return "loading";
  else if (isSubmitting.value === "success") return "success";
  else if (
    isSubmitting.value === "error" &&
    !emailErrors.value[0] &&
    !termsErrors.value[0] &&
    !passwordErrors.value[0]
  )
    return "default";
  else if (
    isSubmitting.value === "error" &&
    (emailErrors.value[0] || termsErrors.value[0] || passwordErrors.value[0])
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
        :error="emailErrors[0]"
        name="email"
        aurofocus="true"
      />
      <InputField
        v-model="passwordRef"
        id="password"
        label="Mot de passe"
        type="text"
        placeholder="Ax1fy9@kzV3"
        icon="key"
        :error="passwordErrors[0]"
        name="password"
      />
      <div class="sign-up__form__wrapper">
        <input
          type="checkbox"
          id="terms"
          v-model="termsRef"
          :class="{ shake: termsErrors[0] }"
        />
        <label for="terms"
          >J'accepte les
          <NuxtLink to="/" class="button--tertiary-dark"
            >conditions d'utilisation</NuxtLink
          >
          et conscent à recevoir des communications commerciales de Tekila Web
          Factory</label
        >
      </div>
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

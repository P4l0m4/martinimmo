<script setup lang="ts">
import { onMounted, ref } from "vue";
import { checkExistingToken, signOut } from "@/utils/supabase";

const isUserLoggedIn = ref();

onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();
});
</script>
<template>
  <template v-if="isUserLoggedIn?.user.aud">
    <Container>
      <h1 class="subtitles">Mon compte</h1>
      <ul class="account-info">
        <li class="account-info__element">
          <span class="account-info__element__icon"
            ><IconComponent icon="mail" color="#232323"
          /></span>
          {{ isUserLoggedIn?.user.email }}
        </li>
        <li class="account-info__element">
          <span class="account-info__element__icon"
            ><IconComponent icon="star" color="#232323"
          /></span>
          Compte
          {{ isUserLoggedIn?.user.user_metadata.accountType }}
        </li>
      </ul>
      <PrimaryButton button-type="dark" @click="signOut" class="logout-button"
        >Déconnexion</PrimaryButton
      >
    </Container>
  </template>
  <template v-else>
    <MustBeAuthenticated />
  </template>
</template>
<style lang="scss" scoped>
.account-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__element {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &__icon {
      opacity: 0.6;
    }
  }
}
</style>

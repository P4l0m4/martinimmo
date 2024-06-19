<script setup lang="ts">
import { onMounted, ref } from "vue";
// import { checkExistingToken } from "@/utils/supabase";

const isUserLoggedIn = ref();

onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();
});
</script>
<template>
  <header class="header">
    <nav class="header__nav">
      <ul class="header__nav__ul">
        <li class="header__nav__ul__li">
          <NuxtLink to="/" exact>Accueil</NuxtLink>
        </li>
        <li class="header__nav__ul__li" v-if="isUserLoggedIn?.user.aud">
          <NuxtLink to="/recherche" exact>Recherche</NuxtLink>
        </li>
        <AuthButtons v-else />
        <li
          v-if="isUserLoggedIn?.user.aud"
          class="header__nav__ul__li circle-link"
        >
          <NuxtLink to="/mon-compte" exact aria-label="Mon compte"
            ><IconComponent icon="user" color="#232323"
          /></NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
<style lang="scss" scoped>
.router-link-exact-active {
  border-bottom: 2px solid $secondary-color;
}

.header {
  display: flex;
  padding: 1rem;
  background-color: $primary-color;
  box-shadow: $shadow-black;

  &__nav {
    width: 100%;
    &__ul {
      list-style: none;
      display: flex;
      gap: 1rem;
      align-items: center;
      width: 100%;

      &__li.circle-link {
        margin-left: auto;
        a {
          display: flex;
          padding: 0.75rem;
          background-color: $secondary-color-faded;
          border-radius: 50%;
        }
      }
    }
  }
}

.margin-left-auto {
  margin-left: auto;
}
</style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { checkExistingToken } from "@/utils/supabase";
import { useAccountStore } from "@/stores/accountStore";
import { debounce } from "@/utils/debounce";

const accountStore = useAccountStore();
const isUserLoggedIn = ref();

const credits = ref(0);

const updateCredits = debounce(async () => {
  credits.value = await getCredits(isUserLoggedIn.value.user.id);
}, 600);

document.addEventListener("click", updateCredits);

onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();

  if (isUserLoggedIn.value) {
    accountStore.updateAccountType(
      isUserLoggedIn.value.user.user_metadata.accountType
    );
    accountStore.creditsFromDB(isUserLoggedIn.value.user.id);
    credits.value = await getCredits(isUserLoggedIn.value.user.id);
  }
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
          <span class="credits"
            >{{ credits?.credits
            }}<IconComponent icon="credit-card" color="#6800ba"
          /></span>
          <NuxtLink
            to="/mon-compte"
            exact
            aria-label="Mon compte"
            v-tooltip:bottom="'Mon compte'"
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
        display: flex;
        align-items: center;
        gap: 1rem;

        .credits {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: $thick;
          border-radius: $radius;
          color: $secondary-color;
        }
        a {
          display: flex;
          padding: 0.75rem;
          background-color: $secondary-color-faded;
          border-radius: 50%;
        }
      }

      &__li a {
        font-weight: $skinny-thick;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
      }
    }
  }
}

.margin-left-auto {
  margin-left: auto;
}
</style>

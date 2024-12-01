<script setup lang="ts">
import { onMounted, ref, onUnmounted, computed } from "vue";
import { checkExistingToken, generateUser } from "@/utils/supabase";
import { useAccountStore } from "@/stores/accountStore";
import { debounce } from "@/utils/debounce";
import { useRoute } from "vue-router";

const route = useRoute();

const accountStore = useAccountStore();
const isUserLoggedIn = ref();

const credits = ref(0);

const updateCredits = debounce(async () => {
  if (isUserLoggedIn.value && isUserLoggedIn.value.user.id) {
    credits.value = await getCredits(isUserLoggedIn.value.user.id);
  }
}, 800);

document.addEventListener("click", updateCredits);

const notification = ref(localStorage.getItem("notification") === "true");

const checkLocalStorage = () => {
  notification.value = localStorage.getItem("notification") === "true";
};

let intervalId: any;

const isHome = computed(() => {
  return route.path === "/";
});

onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();

  if (isUserLoggedIn.value) {
    accountStore.updateAccountType(
      isUserLoggedIn.value.user.user_metadata.accountType
    );

    if (isUserLoggedIn.value.user) {
      accountStore.creditsFromDB(isUserLoggedIn.value.user.id);
      credits.value = await getCredits(isUserLoggedIn.value.user.id);
    }

    if (credits.value.credits) {
      generateUser();
    }

    intervalId = setInterval(checkLocalStorage, 1000);
  }
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
<template>
  <header class="header" :class="{ 'header--dark': isHome }">
    <nav class="header__nav">
      <ul class="header__nav__ul" :class="{ 'header__nav__ul--dark': isHome }">
        <li class="header__nav__ul__li">
          <NuxtLink to="/" exact>Accueil</NuxtLink>
        </li>
        <li class="header__nav__ul__li">
          <NuxtLink to="/recherche" exact>Recherche</NuxtLink>
        </li>
        <li class="header__nav__ul__li">
          <NuxtLink to="/FAQ" exact>FAQ</NuxtLink>
        </li>

        <AuthButtons v-if="isUserLoggedIn?.user.credits" />
        <li
          v-if="isUserLoggedIn?.user.aud && credits?.credits"
          class="header__nav__ul__li circle-link"
        >
          <span class="credits"
            >{{ credits?.credits
            }}<IconComponent icon="credit-card" color="#4885de"
          /></span>
          <NuxtLink
            to="/mon-compte"
            :class="{
              'notification-circle': notification === true,
            }"
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
.notification-circle {
  // border: $secondary-color 2px solid !important;
  animation: bump 1s infinite;
}

@keyframes bump {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.router-link-exact-active {
  border-bottom: 2px solid $secondary-color-alt;
}

.header {
  display: flex;
  padding: 1rem;
  background-color: $primary-color;
  box-shadow: $shadow-black;
  height: 72px;
  z-index: 1000;

  &__nav {
    width: 100%;
    display: flex;
    align-items: center;

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
          color: $secondary-color-alt;
        }
        a {
          display: flex;
          padding: 0.75rem;
          background-color: $secondary-color-alt;
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

      &--dark {
        a {
          color: $base-color;
        }
      }
    }
  }

  &--dark {
    background-color: $secondary-color;
  }
}

.margin-left-auto {
  margin-left: auto;
}
</style>

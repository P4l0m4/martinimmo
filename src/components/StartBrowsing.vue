<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isHome = ref(true);

const message = ref("à vendre");
const messages = ["à vendre", "à débarasser", "à nettoyer"];
let intervalId: any;
function changeMessage() {
  let index = messages.indexOf(message.value);
  intervalId = setInterval(() => {
    if (index === messages.length) index = 0;
    message.value = messages[index++];
  }, 2000);
}

onMounted(() => {
  changeMessage();

  if (route.path === "/") {
    isHome.value = true;
  } else {
    isHome.value = false;
  }
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
<template>
  <Container class="centered-content" style="min-height: calc(100dvh - 72px)">
    <h1 class="titles" :class="{ 'base-color': isHome }">
      Ils ont des biens
      <span
        :class="{ 'secondary-color-alt': isHome, 'secondary-color': !isHome }"
        >{{ message }}</span
      >, trouvez-les en un clic 🖱️
    </h1>

    <div class="buttons" v-if="isHome">
      <NuxtLink class="button secondary--light scale-on-hover" to="/recherche"
        >Commencer ma recherche</NuxtLink
      >
      <NuxtLink class="button primary--light scale-on-hover" to="/mon-compte"
        >Voir mes profils débloqués</NuxtLink
      >
    </div>
    <div class="buttons" v-else>
      <NuxtLink class="button secondary--dark scale-on-hover" to="/recherche"
        >Commencer ma recherche</NuxtLink
      >
      <NuxtLink class="button primary--dark scale-on-hover" to="/mon-compte"
        >Voir mes profils débloqués</NuxtLink
      >
    </div></Container
  >
</template>
<style lang="scss" scoped>
.titles {
  max-width: 1000px;
  text-align: center;
  text-wrap: balance;
}
.buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 450px;
  flex-direction: column;

  @media (min-width: $big-tablet-screen) {
    flex-direction: row;
  }
}
</style>

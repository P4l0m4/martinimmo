<script lang="ts" setup>
import { onMounted, ref } from "vue";

const message = ref("à vendre");
const messages = ["à vendre", "à débarasser", "à nettoyer"];

function changeMessage() {
  let index = messages.indexOf(message.value);
  setInterval(() => {
    if (index === messages.length) index = 0;
    message.value = messages[index++];
  }, 2000);
}

onMounted(() => {
  changeMessage();
});
</script>
<template>
  <Container class="centered-content" style="min-height: calc(100dvh - 72px)">
    <h1 class="titles">
      Ils ont des biens <span class="secondary-color">{{ message }}</span
      >, trouvez-les en un clic 🖱️
    </h1>
    <div class="buttons">
      <NuxtLink class="button secondary--dark" to="/recherche"
        >Commencer ma recherche</NuxtLink
      >
      <NuxtLink class="button primary--dark" to="/mon-compte"
        >Voir mes contacts débloqués</NuxtLink
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

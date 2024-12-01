<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { checkExistingToken } from "@/utils/supabase";

const route = useRoute();
const isUserLoggedIn = ref();

onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();
});

useHead({
  title: "MartinImmo | Accueil",
  meta: [
    {
      name: "description",
      content:
        "Rentrez en contact avec des millions de particuliers cherchant à vendre, nettoyer ou débarasser un bien immobillier. 10 crédits offers et 10 crédits suplémentaires en renseignant le code de votre parrain à l'inscription.",
    },
    { property: "og:title", content: "MartinImmo | Accueil" },
    {
      property: "og:description",
      content: `Rentrez en contact avec des millions de particuliers cherchant à vendre, nettoyer ou débarasser un bien immobillier. 
  10 crédits offers et 10 crédits suplémentaires en renseignant le code de votre parrain à l'inscription.`,
    },
    {
      property: "og:url",
      content: `https://martinimmo.netlify.app${route.path}`,
    },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "fr_FR" },
  ],
});
</script>
<template>
  <div class="background">
    <img src="@/assets/images/blob.webp" alt="blob" class="blob" />
    <img src="@/assets/images/building.svg" alt="blob" class="building" />
    <img src="@/assets/images/blob2.webp" alt="blob" class="blob" />

    <MustBeAuthenticated v-if="!isUserLoggedIn?.user.aud" />
    <StartBrowsing v-else />
  </div>
</template>
<style lang="scss" scoped>
.background {
  background-color: $secondary-color;
  width: 100vw;
  height: calc(100dvh - 72px);
  position: relative;
  max-width: 2064px;
  z-index: 0;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    background-image: linear-gradient(
      180deg,
      $secondary-color,
      transparent 60%
    );
    z-index: 1;
    width: 100%;
    height: 100px;
  }

  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(transparent 60%, $secondary-color);
    z-index: 1;
    width: 100%;
    height: 100px;
  }

  .blob {
    position: absolute;
    width: 40%;
    height: auto;
    object-fit: contain;

    &:nth-of-type(1) {
      top: -35%;
      left: -10%;
      transform: rotate(200deg);
    }
    &:nth-of-type(3) {
      bottom: -40%;
      right: -5%;
      transform: rotate(215deg);
    }
  }

  .building {
    position: absolute;
    bottom: -10%;
    left: 0;
    right: 0;
    margin: auto;
    width: 25%;
    height: 35%;
    opacity: 0.3;
    z-index: 2;
  }
}
</style>

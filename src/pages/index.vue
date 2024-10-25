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
  <MustBeAuthenticated v-if="!isUserLoggedIn?.user.aud" />
  <StartBrowsing v-else />
</template>

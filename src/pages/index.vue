<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { checkExistingToken } from "@/utils/supabase";
const isUserLoggedIn = ref();
onMounted(async () => {
  isUserLoggedIn.value = await checkExistingToken();
});
</script>
<template>
  <MustBeAuthenticated v-if="!isUserLoggedIn?.user.aud" />
  <StartBrowsing v-else />
</template>

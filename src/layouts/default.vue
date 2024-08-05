<script setup lang="ts">
import { initSupabase } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
import { useAccountStore } from "@/stores/accountStore";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

if (route.params.token) {
  window.location.href = "/sign-up-confirmation";
}

const accountStore = useAccountStore();
const config = useRuntimeConfig();
const supabaseUrl = config.public.SUPABASE_URL;
const supabaseKey = config.public.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

initSupabase(supabase);

onMounted(() => {
  accountStore.updateCredits();
  generateUser();
});
</script>
<template>
  <HeaderComponent />
  <main>
    <slot />
  </main>
  <FooterComponent />
</template>
<style lang="scss">
main {
  display: flex;
  flex-direction: column;
  min-height: calc(100svh - 72px);
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: transform 0.4s ease, border-radius 0.4s ease;
}

.expand-enter-from,
.expand-leave-to {
  transform: scale(0);
  border-radius: 50%;
}
</style>

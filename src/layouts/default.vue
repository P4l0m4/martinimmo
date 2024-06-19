<script setup lang="ts">
import { initSupabase } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
const config = useRuntimeConfig();
const supabaseUrl = config.public.SUPABASE_URL;
const supabaseKey = config.public.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

initSupabase(supabase);
</script>
<template>
  <HeaderComponent />
  <main>
    <slot />
  </main>
</template>
<style lang="scss">
main {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

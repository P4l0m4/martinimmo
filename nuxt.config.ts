// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  srcDir: "src/",
  css: ["@/styles/global.scss"],
  modules: [
    "dayjs-nuxt",
    "@pinia/nuxt",
    [
      "@storyblok/nuxt",
      {
        accessToken: process.env.STORYBLOK_KEY,
        cacheProvider: "memory",
      },
    ],
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/_variables.scss";',
        },
      },
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "fr" },
    },
  },
  runtimeConfig: {
    public: {
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
      ABSTRACT_API_KEY: process.env.ABSTRACT_API_KEY,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
      STORYBLOK_KEY: process.env.STORYBLOK_KEY,
    },
  },
  dayjs: {
    locales: ["fr"],
  },
});

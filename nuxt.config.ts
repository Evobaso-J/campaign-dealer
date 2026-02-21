// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n'],
  devtools: { enabled: true },
  typescript: {
    typeCheck: true,
  },
})

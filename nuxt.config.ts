// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-02-21',
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n'],
  devtools: { enabled: true },
  typescript: {
    /**
     * Might throw and error on running the dev server that looks like this:
     * ```sh
     * [uncaughtException] ENOENT: no such file or directory, chmod '[directory-path]'
     * ```
     * Ignore it. Only happens on the first run and is caused by the type checking process when no typescript files are present in the project.
     */
    typeCheck: true,
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en-US' },
    ],
    defaultLocale: 'en',
  },
})

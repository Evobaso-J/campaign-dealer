// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-02-21",
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxt/test-utils/module",
  ],
  runtimeConfig: {
    ai: {
      provider: "",
      apiKey: "",
      model: "",
      ollamaHost: "",
    },
  },
  css: ["~/assets/css/main.css"],
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
      { code: "en", language: "en-US" },
      { code: "it", language: "it-IT" },
    ],
    defaultLocale: "en",
  },
  eslint: {
    /* Your ESLint options here */
  },
  // Server test files on the routes are automatically
  // picked up as actual routes, causing a server error.
  // We exclude them from the build process to prevent this.
  ignore: ["**/*.test.ts", "**/*.spec.ts"],
  pinia: {
    /**
     * Automatically add stores dirs to the auto imports. This is the same as
     * directly adding the dirs to the `imports.dirs` option. If you want to
     * also import nested stores, you can use the glob pattern `./stores/**`
     * (on Nuxt 3) or `app/stores/**` (on Nuxt 4+)
     *
     * @default `['stores']`
     */
  },
});

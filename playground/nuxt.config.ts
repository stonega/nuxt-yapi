export default defineNuxtConfig({
  modules: ['nuxt-yapi'],
  devtools: { enabled: true },
  compatibilityDate: '2024-12-12',
  yapi: {
    service: process.env.NUXT_YAPI_SERVICE,
    apis: [
      {
        baseUrl: process.env.NUXT_PUBLIC_BASE_URL!,
        token: process.env.NUXT_YAPI_TOKEN,
      },
    ],
  },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  plugins: [
    '~/plugins/polkadot.client.js',
  ],
  css: ['~/asset/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})

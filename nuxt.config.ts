import { defineNuxtConfig } from "nuxt/config"
import { appDescription } from "./src/constants"

export default defineNuxtConfig({
  srcDir: "src/",
  css: ["~/assets/css/index.css"],
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.NUXT_API_BASE_URL || "/api",
    },
  },
  modules: [
    "@nuxt/image",
    "nuxt-icon",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/content",
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
    "@nuxt/eslint",
  ],
  tailwindcss: {
    configPath: "./tailwind.config.cjs",
  },
  ui: {
    icons: ["mdi", "lucide", "vscode-icons", "fa6-brands"],
  },
  image: {
    // Options
  },
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  colorMode: {
    classSuffix: "",
  },

  nitro: {
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },

  app: {
    head: {
      viewport: "width=device-width,initial-scale=1,user-scalable=no",
      link: [
        {
          rel: "icon",
          href: "/favicon.ico",
          sizes: "any",
        },
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/nuxt.svg",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "stylesheet",
          href: "https://rsms.me/inter/inter.css",
        },
      ],
      script: [],
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          name: "description",
          content: appDescription,
        },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
      ],
    },
  },
  content: {
    highlight: {
      // See the available themes on https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-theme
      theme: {
        dark: "github-dark",
        default: "github-light",
      },
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  i18n: {
    locales: ["en", "zh_CN"],
    defaultLocale: "en",
    strategy: "no_prefix",
    vueI18n: "./i18n.config.ts", // if you are using custom path, default
  },

  // devtools: {
  //   enabled: true,
  // },
  ssr: false,
  vite: {
    build: {
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 500_000,
          inlineDynamicImports: true,
        },
      },
    },
  },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  // 소스 코드 디렉토리 (개발 코드 분리)
  srcDir: 'app',

  // Standalone 모드 설정 (npx jjiban 실행용)
  nitro: {
    preset: 'node-server'
  },

  // 런타임 설정 (TSK-02-03-02: ISS-001 반영)
  runtimeConfig: {
    jjibanBasePath: process.env.JJIBAN_BASE_PATH || process.cwd(),
  },

  // TypeScript 엄격 모드
  typescript: {
    strict: true,
    typeCheck: false  // 다른 Task 의존성(Pinia) 완료 후 활성화
  },

  // SSR 활성화 (기본값)
  ssr: true,

  // 개발 서버 설정
  devServer: {
    port: 3000
  },

  // 호환성 날짜
  compatibilityDate: '2024-11-01',

  // 개발 도구
  devtools: { enabled: true },

  // 모듈 등록
  modules: [
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
    '@pinia/nuxt'
  ],

  // Pinia 설정
  pinia: {
    storesDirs: ['./stores/**']
  },

  // PrimeVue 설정
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primevue',
            order: 'tailwind-base, primevue, tailwind-utilities'
          }
        }
      },
      ripple: true
    }
  },

  // 글로벌 CSS
  css: [
    'primeicons/primeicons.css',
    '~/assets/css/main.css'
  ],

  // TailwindCSS 설정
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts'
  }
})

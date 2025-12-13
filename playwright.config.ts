import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 테스트 파일 위치
  testDir: './tests/e2e',

  // 병렬 실행
  fullyParallel: true,

  // CI에서 실패 시 재시도 횟수
  retries: process.env.CI ? 2 : 0,

  // 병렬 워커 수
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // 글로벌 테스트 타임아웃
  timeout: 60000,

  // 공통 설정
  use: {
    // 베이스 URL
    baseURL: 'http://localhost:3333',

    // 스크린샷 (실패 시만)
    screenshot: 'only-on-failure',

    // 트레이스 (실패 시만)
    trace: 'on-first-retry',

    // 비디오 (실패 시만)
    video: 'on-first-retry'
  },

  // 프로젝트 (브라우저별)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  // 개발 서버 설정
  webServer: {
    command: 'npm run dev -- --port 3333',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe'
  },

  // 출력 폴더
  outputDir: 'test-results/artifacts'
})

/**
 * Playwright Global Teardown
 *
 * 테스트 완료 후 테스트 데이터를 정리합니다.
 * playwright.config.ts의 globalTeardown에서 호출됩니다.
 */

import { rm } from 'fs/promises';
import { TEST_BASE } from './global-setup';

async function globalTeardown() {
  console.log('[Global Teardown] Cleaning up E2E test data...');

  try {
    await rm(TEST_BASE, { recursive: true, force: true });
    console.log('[Global Teardown] E2E test data cleaned up');
  } catch (error) {
    console.warn('[Global Teardown] Failed to clean up:', error);
  }
}

export default globalTeardown;

/**
 * Playwright Global Teardown
 *
 * 테스트 완료 후 테스트 데이터를 정리합니다.
 * playwright.config.ts의 globalTeardown에서 호출됩니다.
 */

import { rm } from 'fs/promises';
import { join } from 'path';

const JJIBAN_ROOT = join(process.cwd(), '.jjiban');
const TEST_PROJECT_ID = 'project';

async function globalTeardown() {
  console.log('[Global Teardown] Cleaning up E2E test data...');

  try {
    // 테스트 프로젝트 폴더만 삭제 (settings는 유지)
    const projectPath = join(JJIBAN_ROOT, 'projects', TEST_PROJECT_ID);
    await rm(projectPath, { recursive: true, force: true });
    console.log('[Global Teardown] E2E test project cleaned up:', projectPath);
  } catch (error) {
    console.warn('[Global Teardown] Failed to clean up:', error);
  }
}

export default globalTeardown;

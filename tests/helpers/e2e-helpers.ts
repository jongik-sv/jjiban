import { Page, expect } from '@playwright/test';

/**
 * 페이지 로드 및 안정화 대기
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
}

/**
 * WBS 데이터 로딩 완료 대기 (안정성 강화 버전)
 */
export async function waitForWbsLoaded(
  page: Page,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = 15000 } = options;

  try {
    // 1. 로딩 스피너 사라질 때까지 대기
    await page.waitForSelector('[data-testid="wbs-loading"]', {
      state: 'hidden',
      timeout
    }).catch(() => {
      // 로딩 스피너가 없을 수도 있음 (이미 로딩 완료)
    });

    // 2. API 응답 완료 대기
    await page.waitForResponse(
      (response) => response.url().includes('/api/projects/') &&
                    response.url().includes('/wbs') &&
                    response.status() < 400,
      { timeout: timeout / 2 }
    ).catch(() => {
      // API가 이미 완료되었을 수 있음
    });

    // 3. 트리 콘텐츠 또는 에러/빈 상태 표시 대기
    await Promise.race([
      page.waitForSelector('[data-testid="wbs-tree-content"]', {
        state: 'visible',
        timeout
      }),
      page.waitForSelector('[data-testid="wbs-error"]', {
        state: 'visible',
        timeout
      }),
      page.waitForSelector('[data-testid="wbs-empty"]', {
        state: 'visible',
        timeout
      })
    ]);

    // 4. 렌더링 안정화 대기 (애니메이션)
    await page.waitForTimeout(100);
  } catch (error) {
    console.error('waitForWbsLoaded failed:', error);
    throw error;
  }
}

/**
 * API 응답 모킹
 */
export async function mockWbsApi(
  page: Page,
  response: any,
  status: number = 200
): Promise<void> {
  await page.route('**/api/projects/*/wbs', async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

/**
 * API 오류 모킹
 */
export async function mockWbsApiError(
  page: Page,
  statusCode: number = 500,
  message: string = 'Internal Server Error'
): Promise<void> {
  await page.route('**/api/projects/*/wbs', async route => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: message })
    });
  });
}

/**
 * 접근성 검증 (기본 ARIA 체크)
 */
export async function checkAccessibility(page: Page): Promise<void> {
  // 기본 ARIA 체크
  const landmarks = await page.locator('[role]').count();
  expect(landmarks).toBeGreaterThan(0);

  // 필수 ARIA 속성 체크 (버튼)
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const hasLabel = await button.evaluate((el) => {
      return el.hasAttribute('aria-label') ||
             (el.textContent?.trim() || '').length > 0;
    });
    expect(hasLabel).toBe(true);
  }

  // 폼 요소 레이블 체크
  const inputs = await page.locator('input[type="text"], input[type="search"]').all();
  for (const input of inputs) {
    const hasLabel = await input.evaluate((el) => {
      const id = el.id;
      return el.hasAttribute('aria-label') ||
             el.hasAttribute('placeholder') ||
             (id && document.querySelector(`label[for="${id}"]`));
    });
    expect(hasLabel).toBe(true);
  }
}

/**
 * 키보드 네비게이션 테스트
 */
export async function testKeyboardNavigation(
  page: Page,
  startSelector: string,
  targetSelector: string
): Promise<void> {
  await page.locator(startSelector).focus();
  await page.keyboard.press('Tab');

  // 포커스 확인 (약간의 대기 후)
  await page.waitForTimeout(100);

  const focused = await page.locator(targetSelector).evaluate(
    el => el === document.activeElement
  );
  expect(focused).toBe(true);
}

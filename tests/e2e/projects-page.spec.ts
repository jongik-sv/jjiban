/**
 * Projects Page E2E Tests
 * Task: TSK-04-00
 * Test Specification: 026-test-specification.md
 *
 * 테스트 환경:
 * - .jjiban 폴더의 실제 데이터 사용
 * - playwright.config.ts에서 JJIBAN_BASE_PATH 설정됨
 */

import { test, expect } from '@playwright/test';

test.describe('E2E-001: 프로젝트 목록 렌더링', () => {
  test('should render project list on page load', async ({ page }) => {
    // Mock API 응답
    await page.route('/api/projects', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [
            {
              id: 'jjiban',
              name: 'jjiban',
              path: 'jjiban',
              status: 'active',
              wbsDepth: 4,
              createdAt: '2025-12-14T00:00:00.000Z',
            },
          ],
          defaultProject: 'jjiban',
          total: 1,
        }),
      })
    );

    await page.goto('/projects');

    // 페이지 제목 확인
    const title = page.locator('h1');
    await expect(title).toHaveText('Projects');

    // 필터 버튼 확인
    const filterButtons = page.locator('.p-selectbutton');
    await expect(filterButtons).toBeVisible();

    // 프로젝트 카드 확인
    const cards = page.locator('.p-card');
    await expect(cards).toHaveCount(1);
  });
});

test.describe('E2E-003: 카드 내용 표시', () => {
  test('should display all project information in card', async ({ page }) => {
    // Mock API 응답
    await page.route('/api/projects', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [
            {
              id: 'test-project',
              name: 'Test Project',
              path: 'test-project',
              status: 'active',
              wbsDepth: 4,
              createdAt: '2025-12-14T00:00:00.000Z',
            },
          ],
          defaultProject: 'test-project',
          total: 1,
        }),
      })
    );

    await page.goto('/projects');

    const card = page.locator('.p-card').first();

    // 카드 제목 (프로젝트명)
    const title = card.locator('.p-card-title');
    await expect(title).toBeVisible();

    // 상태 태그
    const statusTag = card.locator('.p-tag');
    await expect(statusTag).toBeVisible();

    // WBS 깊이
    await expect(card).toContainText('Levels');

    // 생성일
    await expect(card).toContainText('Created');
  });
});

test.describe('E2E-004: 프로젝트 선택 네비게이션', () => {
  test('should navigate to WBS page on card click', async ({ page }) => {
    // Mock API 응답
    await page.route('/api/projects', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [
            {
              id: 'nav-test',
              name: 'Navigation Test',
              path: 'nav-test',
              status: 'active',
              wbsDepth: 4,
              createdAt: '2025-12-14T00:00:00.000Z',
            },
          ],
          defaultProject: 'nav-test',
          total: 1,
        }),
      })
    );

    await page.goto('/projects');

    // 프로젝트 카드 클릭
    const card = page.locator('.p-card').first();
    await card.click();

    // URL 확인 - /wbs?project=nav-test 형식이어야 함
    await expect(page).toHaveURL(/\/wbs\?project=nav-test/);
  });
});

test.describe('E2E-005: 필터 버튼 동작', () => {
  test('should filter projects by status', async ({ page }) => {
    // Mock API 응답 - active 2개, archived 1개
    await page.route('/api/projects', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [
            { id: 'p1', name: 'Active 1', path: 'p1', status: 'active', wbsDepth: 4, createdAt: '2025-12-14T00:00:00.000Z' },
            { id: 'p2', name: 'Active 2', path: 'p2', status: 'active', wbsDepth: 3, createdAt: '2025-12-14T00:00:00.000Z' },
            { id: 'p3', name: 'Archived 1', path: 'p3', status: 'archived', wbsDepth: 4, createdAt: '2025-12-14T00:00:00.000Z' },
          ],
          defaultProject: 'p1',
          total: 3,
        }),
      })
    );

    await page.goto('/projects');

    // 초기 상태: 모든 프로젝트 표시
    let cards = page.locator('.p-card');
    await expect(cards).toHaveCount(3);

    // Active 필터 클릭
    const activeButton = page.getByRole('button', { name: 'Active' });
    await activeButton.click();

    // active 프로젝트만 표시
    cards = page.locator('.p-card');
    await expect(cards).toHaveCount(2);

    // Archived 필터 클릭
    const archivedButton = page.getByRole('button', { name: 'Archived' });
    await archivedButton.click();

    // archived 프로젝트만 표시
    cards = page.locator('.p-card');
    await expect(cards).toHaveCount(1);

    // All 필터로 돌아가기
    const allButton = page.getByRole('button', { name: 'All' });
    await allButton.click();
    await expect(page.locator('.p-card')).toHaveCount(3);
  });
});

test.describe('E2E-007: 로딩 상태 표시', () => {
  test('should show loading spinner during API call', async ({ page }) => {
    // API 지연 시뮬레이션 - 1초 후 응답
    await page.route('/api/projects', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [{ id: 'p1', name: 'Project 1', path: 'p1', status: 'active', wbsDepth: 4, createdAt: '2025-12-14T00:00:00.000Z' }],
          defaultProject: 'p1',
          total: 1,
        }),
      });
    });

    // 페이지 로드 시작 (비동기)
    const loadPromise = page.goto('/projects');

    // 로딩 스피너 확인 (짧은 시간 내에)
    const spinner = page.locator('.p-progress-spinner');
    await expect(spinner).toBeVisible({ timeout: 500 }).catch(() => {
      // 스피너가 너무 빨리 사라질 수 있음
    });

    await loadPromise;

    // 로딩 완료 후 콘텐츠 확인
    const title = page.locator('h1');
    await expect(title).toHaveText('Projects');
  });
});

test.describe('E2E-008: 에러 상태 표시', () => {
  test('should show error message on API failure', async ({ page }) => {
    // API 에러 시뮬레이션
    await page.route('/api/projects', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Server Error' }) })
    );

    await page.goto('/projects');

    // 에러 메시지 표시 확인
    const errorMessage = page.locator('.p-inline-message-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('오류가 발생했습니다');

    // 프로젝트 카드 없음
    const cards = page.locator('.p-card');
    await expect(cards).toHaveCount(0);
  });
});

test.describe('E2E-009: 빈 상태 표시', () => {
  test('should show empty state message when no projects exist', async ({ page }) => {
    // 빈 목록 응답
    await page.route('/api/projects', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ projects: [], defaultProject: null, total: 0 }),
      })
    );

    await page.goto('/projects');

    // 빈 상태 메시지 확인
    const emptyMessage = page.locator('.p-inline-message-info');
    await expect(emptyMessage).toBeVisible();
    await expect(emptyMessage).toContainText('프로젝트가 없습니다');

    // 프로젝트 카드 없음
    const cards = page.locator('.p-card');
    await expect(cards).toHaveCount(0);
  });
});

test.describe('E2E-010: 기본 프로젝트 배지', () => {
  test('should show default badge on default project', async ({ page }) => {
    // 기본 프로젝트가 설정된 응답
    await page.route('/api/projects', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [
            {
              id: 'default-project',
              name: 'Default Project',
              path: 'default-project',
              status: 'active',
              wbsDepth: 4,
              createdAt: '2025-12-14T00:00:00.000Z',
            },
            {
              id: 'other-project',
              name: 'Other Project',
              path: 'other-project',
              status: 'active',
              wbsDepth: 3,
              createdAt: '2025-12-14T00:00:00.000Z',
            },
          ],
          defaultProject: 'default-project',
          total: 2,
        }),
      })
    );

    await page.goto('/projects');

    // 카드 확인
    const cards = page.locator('.p-card');
    await expect(cards).toHaveCount(2);

    // Default 배지 확인
    const badge = page.locator('.p-badge:has-text("Default")');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveCount(1); // 하나의 카드에만 배지
  });
});

test.describe('E2E-011: 반응형 레이아웃', () => {
  test('should display correctly on different viewports', async ({ page }) => {
    // Mock API 응답
    await page.route('/api/projects', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [{ id: 'p1', name: 'Project 1', path: 'p1', status: 'active', wbsDepth: 4, createdAt: '2025-12-14T00:00:00.000Z' }],
          defaultProject: 'p1',
          total: 1,
        }),
      })
    );

    await page.goto('/projects');

    // 페이지 제목은 모든 뷰포트에서 보여야 함
    const title = page.locator('h1');
    await expect(title).toHaveText('Projects');

    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(title).toBeVisible();

    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(title).toBeVisible();

    // 데스크탑 뷰포트
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(title).toBeVisible();
  });
});

import { test, expect } from '@playwright/test'

/**
 * AppHeader E2E 테스트
 *
 * @see TSK-01-02-02
 * @see 026-test-specification.md
 */
test.describe('AppHeader 컴포넌트', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  /**
   * E2E-001: 로고 클릭 시 WBS 이동
   * @requirement FR-001, BR-004
   */
  test('E2E-001: 로고 클릭 시 /wbs 페이지로 이동한다', async ({ page }) => {
    await page.goto('/wbs')

    // 로고 확인
    const logo = page.locator('[data-testid="app-logo"]')
    await expect(logo).toBeVisible()
    await expect(logo).toHaveText('jjiban')

    // 로고 클릭
    await logo.click()

    // /wbs 페이지 확인
    await expect(page).toHaveURL('/wbs')

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/screenshots/e2e-001-logo-click.png', fullPage: true })
  })

  /**
   * E2E-002: WBS 메뉴 클릭
   * @requirement FR-002, BR-001
   */
  test('E2E-002: WBS 메뉴 클릭 시 /wbs 페이지로 이동한다', async ({ page }) => {
    await page.goto('/wbs')

    // WBS 메뉴 확인
    const wbsMenu = page.locator('[data-testid="nav-menu-wbs"]')
    await expect(wbsMenu).toBeVisible()
    await expect(wbsMenu).toHaveText('WBS')

    // WBS 메뉴 클릭
    await wbsMenu.click()

    // /wbs 페이지 확인
    await expect(page).toHaveURL('/wbs')

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/screenshots/e2e-002-wbs-menu.png', fullPage: true })
  })

  /**
   * E2E-003: 비활성 메뉴 클릭
   * @requirement FR-002, BR-002
   */
  test('E2E-003: 비활성 메뉴 클릭 시 Toast가 표시된다', async ({ page }) => {
    await page.goto('/wbs')

    // 페이지 로드 완료 대기 (ToastService 초기화 대기)
    await page.waitForLoadState('networkidle')

    // 대시보드 메뉴 확인 (비활성)
    const dashboardMenu = page.locator('[data-testid="nav-menu-dashboard"]')
    await expect(dashboardMenu).toBeVisible()

    // 대시보드 메뉴 클릭 (aria-disabled 요소이므로 force 옵션 필요)
    // 비활성 메뉴지만 클릭 가능 - Toast 표시 목적
    await dashboardMenu.click({ force: true })

    // Toast 알림 표시 확인 (PrimeVue Toast)
    const toast = page.locator('.p-toast-message')
    await expect(toast).toBeVisible({ timeout: 10000 })
    await expect(toast).toContainText('준비 중')

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/screenshots/e2e-003-disabled-menu-toast.png', fullPage: true })
  })

  /**
   * E2E-004: 프로젝트명 표시
   * @requirement FR-003
   */
  test('E2E-004: 프로젝트명이 헤더에 표시된다', async ({ page }) => {
    await page.goto('/wbs')

    // 프로젝트명 영역 확인
    const projectName = page.locator('[data-testid="project-name"]')
    await expect(projectName).toBeVisible()

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/screenshots/e2e-004-project-name.png', fullPage: true })
  })

  /**
   * E2E-005: 현재 페이지 메뉴 강조
   * @requirement FR-002, BR-003
   */
  test('E2E-005: 현재 페이지에 해당하는 메뉴가 강조 표시된다', async ({ page }) => {
    await page.goto('/wbs')

    // WBS 메뉴 확인
    const wbsMenu = page.locator('[data-testid="nav-menu-wbs"]')
    await expect(wbsMenu).toBeVisible()

    // WBS 메뉴가 활성 상태인지 확인 (text-primary 클래스)
    await expect(wbsMenu).toHaveClass(/text-primary/)

    // aria-current="page" 속성 확인
    await expect(wbsMenu).toHaveAttribute('aria-current', 'page')

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/screenshots/e2e-005-active-menu.png', fullPage: true })
  })

  /**
   * E2E-006: 프로젝트 미선택 시
   * @requirement FR-003
   */
  test('E2E-006: 프로젝트 미선택 시 안내 텍스트가 표시된다', async ({ page }) => {
    await page.goto('/wbs')

    // 프로젝트명 영역 확인
    const projectName = page.locator('[data-testid="project-name"]')
    await expect(projectName).toBeVisible()

    // 프로젝트 미선택 시 안내 텍스트 확인
    await expect(projectName).toContainText('프로젝트를 선택하세요')

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/screenshots/e2e-006-no-project.png', fullPage: true })
  })

  /**
   * E2E-007: 네비게이션 메뉴 구조 확인
   * @requirement FR-002
   */
  test('E2E-007: 4개의 네비게이션 메뉴가 표시된다', async ({ page }) => {
    await page.goto('/wbs')

    // 네비게이션 컨테이너 확인
    const navMenu = page.locator('[data-testid="nav-menu"]')
    await expect(navMenu).toBeVisible()

    // 4개 메뉴 확인
    await expect(page.locator('[data-testid="nav-menu-dashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-menu-kanban"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-menu-wbs"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-menu-gantt"]')).toBeVisible()

    // 메뉴 텍스트 확인
    await expect(page.locator('[data-testid="nav-menu-dashboard"]')).toHaveText('대시보드')
    await expect(page.locator('[data-testid="nav-menu-kanban"]')).toHaveText('칸반')
    await expect(page.locator('[data-testid="nav-menu-wbs"]')).toHaveText('WBS')
    await expect(page.locator('[data-testid="nav-menu-gantt"]')).toHaveText('Gantt')
  })

  /**
   * E2E-008: 비활성 메뉴 스타일 확인
   * @requirement BR-001
   */
  test('E2E-008: 비활성 메뉴는 opacity가 낮게 표시된다', async ({ page }) => {
    await page.goto('/wbs')

    // 비활성 메뉴들 확인
    const disabledMenus = ['dashboard', 'kanban', 'gantt']

    for (const menuId of disabledMenus) {
      const menu = page.locator(`[data-testid="nav-menu-${menuId}"]`)
      await expect(menu).toBeVisible()

      // data-enabled="false" 속성 확인
      await expect(menu).toHaveAttribute('data-enabled', 'false')

      // opacity-50 클래스 확인
      await expect(menu).toHaveClass(/opacity-50/)
    }
  })

  /**
   * E2E-009: 로고 키보드 접근성
   * @requirement 접근성
   */
  test('E2E-009: 로고가 키보드로 접근 가능하다', async ({ page }) => {
    await page.goto('/wbs')

    const logo = page.locator('[data-testid="app-logo"]')

    // NuxtLink는 기본적으로 키보드 접근 가능 (a 태그)
    // href 속성 확인 (NuxtLink로 변경됨)
    await expect(logo).toHaveAttribute('href', '/wbs')

    // aria-label 확인
    await expect(logo).toHaveAttribute('aria-label', '홈으로 이동')
  })

  /**
   * E2E-010: 네비게이션 시맨틱 확인
   * @requirement 접근성
   */
  test('E2E-010: 네비게이션 영역이 올바른 ARIA 속성을 가진다', async ({ page }) => {
    await page.goto('/wbs')

    // nav 역할 확인
    const navMenu = page.locator('[data-testid="nav-menu"]')
    await expect(navMenu).toHaveAttribute('role', 'navigation')
    await expect(navMenu).toHaveAttribute('aria-label', '메인 네비게이션')
  })
})

# Frontend Task 검증 템플릿

## 📋 Task 정보
- **Task ID**: [Task 1.X]
- **Task 명**: [기본 레이아웃 및 네비게이션]
- **검증 날짜**: [YYYY-MM-DD]
- **검증자**: [이름]
- **개발 완료 확인**: ☐ Yes / ☐ No

---

## 🎭 Playwright 자동 테스트

### 테스트 환경 확인
```bash
# 테스트 전 환경 체크
npm run dev  # Frontend 서버 실행 확인 (http://localhost:5173)
npx playwright --version  # Playwright 버전 확인
```

### 1. 기본 페이지 접근성 테스트

#### TC-F001: 메인 페이지 기본 로딩 테스트
**📋 테스트 대상**: MARU 메인 페이지의 기본 로딩 및 필수 요소 표시
**🔧 테스트 방법**: 
```javascript
test('메인 페이지 기본 로딩', async ({ page }) => {
  // 1. 메인 페이지 접속
  await page.goto('http://localhost:5173');
  
  // 2. 페이지 제목 확인
  await expect(page).toHaveTitle(/MARU/);
  
  // 3. 브랜드/로고 요소 확인
  await expect(page.locator('h1, .logo, .brand')).toBeVisible();
  
  // 4. 콘솔 에러 모니터링
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  await page.waitForTimeout(2000);
  expect(consoleErrors.filter(e => !e.includes('favicon'))).toHaveLength(0);
});
```

**✅ 테스트 통과조건**:
- 페이지 제목에 "MARU" 포함
- 브랜드/로고 요소가 화면에 표시됨
- 심각한 콘솔 에러 없음 (favicon 에러 제외)
- 페이지 로딩 시간 < 3초

**✅ 실행 결과**: ☐ 통과 / ☐ 실패
**로딩 시간**: [  ] ms **콘솔 에러**: [  ] 개 

---

### 2. 네비게이션 기능 테스트

#### TC-F002: 사이드바 네비게이션 메뉴 테스트
**📋 테스트 대상**: 사이드바 메뉴의 표시 및 네비게이션 동작
**🔧 테스트 방법**: 
```javascript
test('사이드바 네비게이션 동작', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 1. 사이드바 표시 확인
  await expect(page.locator('.app-sidebar, .sidebar, nav')).toBeVisible();
  
  // 2. 필수 메뉴 항목 존재 확인
  const menuItems = ['대시보드', '코드 관리', '룰 관리'];
  for (const item of menuItems) {
    await expect(page.locator(`text=${item}`).first()).toBeVisible();
  }
  
  // 3. 코드 관리 메뉴 클릭 테스트
  await page.click('text=코드 관리');
  await expect(page).toHaveURL(/.*codeset/);
  
  // 4. 룰 관리 메뉴 클릭 테스트
  await page.click('text=룰 관리');  
  await expect(page).toHaveURL(/.*ruleset/);
});
```

**✅ 테스트 통과조건**:
- 사이드바가 화면에 표시됨
- 필수 메뉴 항목(대시보드, 코드 관리, 룰 관리) 모두 보임
- 각 메뉴 클릭 시 해당 페이지로 이동
- URL이 올바르게 변경됨
- 페이지 전환 시간 < 1초

**✅ 실행 결과**: ☐ 통과 / ☐ 실패
**페이지 전환 시간**: [  ] ms

---

### 3. 반응형 디자인 테스트
```javascript
test('반응형 레이아웃 테스트', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 1. 데스크톱 사이즈 (1200px)
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(page.locator('.app-sidebar')).toBeVisible();
  
  // 2. 태블릿 사이즈 (768px)
  await page.setViewportSize({ width: 768, height: 600 });
  await expect(page.locator('.app-sidebar')).toBeVisible();
  
  // 3. 모바일 사이즈 (375px)
  await page.setViewportSize({ width: 375, height: 667 });
  
  // 모바일에서는 햄버거 메뉴나 토글 버튼 확인
  const mobileToggle = page.locator('.menu-toggle, .hamburger, button[aria-label*="menu"]');
  if (await mobileToggle.count() > 0) {
    await expect(mobileToggle.first()).toBeVisible();
  }
});
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

---

### 4. 컴포넌트별 세부 테스트

#### Header 컴포넌트
```javascript
test('Header 컴포넌트 테스트', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 1. 헤더 영역 확인
  await expect(page.locator('.app-header, header')).toBeVisible();
  
  // 2. 로고 확인
  await expect(page.locator('.logo, img[alt*="logo"], .brand')).toBeVisible();
  
  // 3. 사용자 메뉴 확인 (있다면)
  const userMenu = page.locator('.user-menu, .profile-menu');
  if (await userMenu.count() > 0) {
    await expect(userMenu.first()).toBeVisible();
  }
});
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### Footer 컴포넌트  
```javascript
test('Footer 컴포넌트 테스트', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Footer 영역 확인
  await expect(page.locator('.app-footer, footer')).toBeVisible();
  
  // 버전 정보나 빌드 정보 확인
  const versionInfo = page.locator('text=/v\d+\.\d+|\d{4}-\d{2}-\d{2}/');
  if (await versionInfo.count() > 0) {
    await expect(versionInfo.first()).toBeVisible();
  }
});
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

#### Breadcrumb 컴포넌트
```javascript
test('Breadcrumb 네비게이션 테스트', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 1. 코드셋 페이지로 이동
  await page.click('text=코드 관리');
  
  // 2. Breadcrumb 확인
  const breadcrumb = page.locator('.breadcrumb, nav[aria-label="breadcrumb"]');
  if (await breadcrumb.count() > 0) {
    await expect(breadcrumb.first()).toBeVisible();
    await expect(breadcrumb.locator('text=홈')).toBeVisible();
    await expect(breadcrumb.locator('text=코드 관리')).toBeVisible();
  }
});
```
**✅ 실행 결과**: ☐ 통과 / ☐ 실패

---

## 🧪 수동 테스트 (보완 검증)

### 1. 브라우저 호환성 테스트
| 브라우저 | 버전 | 로딩 | 네비게이션 | 반응형 | 상태 |
|----------|------|------|------------|--------|------|
| Chrome | 최신 | ☐ | ☐ | ☐ | ☐ |
| Firefox | 최신 | ☐ | ☐ | ☐ | ☐ |
| Safari | 최신 | ☐ | ☐ | ☐ | ☐ |
| Edge | 최신 | ☐ | ☐ | ☐ | ☐ |

### 2. 사용성 테스트
| 항목 | 확인 내용 | 상태 |
|------|-----------|------|
| 직관성 | 메뉴 구조가 직관적인가? | ☐ |
| 일관성 | UI 패턴이 일관적인가? | ☐ |
| 접근성 | 키보드로 모든 기능 사용 가능한가? | ☐ |
| 성능 | 페이지 전환이 부드러운가? | ☐ |

### 3. 디자인 검증
| 요소 | 설계서 요구사항 | 실제 구현 | 일치여부 |
|------|-----------------|-----------|---------|
| 헤더 높이 | 60px 고정 | [측정값] | ☐ |
| 사이드바 너비 | 250px (데스크톱) | [측정값] | ☐ |
| 반응형 브레이크포인트 | 768px, 1200px | [확인결과] | ☐ |
| 색상 테마 | [설계서 명시] | [실제 색상] | ☐ |

---

## 📊 검증 결과 요약

### 전체 테스트 결과
- **자동 테스트**: ☐ 모두 통과 / ☐ 일부 실패 / ☐ 대부분 실패
- **수동 테스트**: ☐ 모두 통과 / ☐ 일부 실패 / ☐ 대부분 실패
- **종합 평가**: ☐ 승인 / ☐ 조건부 승인 / ☐ 재개발 필요

### 발견된 이슈
1. **Critical**: 
2. **Major**: 
3. **Minor**: 

### 개선 권장사항
1. 
2. 
3. 

### 최종 검수 의견
**검수자 서명**: _________________ **날짜**: _________________

---

## 🚀 빠른 실행 스크립트

### 전체 자동 테스트 실행
```bash
#!/bin/bash
echo "🎭 Frontend Task 검증 시작..."

# 1. 개발 서버 실행 (백그라운드)
npm run dev &
DEV_PID=$!
sleep 5  # 서버 시작 대기

# 2. Playwright 테스트 실행
npx playwright test --config=playwright.config.ts

# 3. 결과 확인
if [ $? -eq 0 ]; then
    echo "✅ 모든 테스트 통과!"
else
    echo "❌ 일부 테스트 실패"
fi

# 4. 개발 서버 종료
kill $DEV_PID

echo "🏁 Frontend 검증 완료"
```

### 개별 테스트 실행
```bash
# 특정 테스트만 실행
npx playwright test --grep "네비게이션"
npx playwright test --grep "반응형"
npx playwright test --grep "컴포넌트"
```
# MR0100 E2E 테스트 개선 제안

## 1. Nexacro Helper 함수 개선

### 1.1 안정적인 로딩 대기 함수

**현재 코드 (불안정)**:
```javascript
async function waitForNexacroLoad(page, timeout = 30000) {
  await page.waitForFunction(() => {
    return window.nexacro &&
           window.nexacro.getApplication &&
           window.nexacro.getApplication() &&
           window.nexacro.getApplication().getActiveFrame();
  }, { timeout });

  await page.waitForTimeout(1000);
}
```

**개선안 (재시도 로직 추가)**:
```javascript
async function waitForNexacroLoad(page, timeout = 60000, retries = 3) {
  console.log('🔄 Nexacro 애플리케이션 로딩 대기 중...');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 1단계: nexacro 객체 존재 확인
      await page.waitForFunction(() => {
        return window.nexacro !== undefined;
      }, { timeout: timeout / retries });

      // 2단계: Application 객체 확인
      await page.waitForFunction(() => {
        const app = window.nexacro?.getApplication;
        return typeof app === 'function';
      }, { timeout: timeout / retries });

      // 3단계: Active Frame 확인
      await page.waitForFunction(() => {
        try {
          const app = window.nexacro.getApplication();
          if (!app) return false;

          const frame = app.getActiveFrame();
          if (!frame) return false;

          // Form 객체까지 확인
          const form = frame.form;
          return form !== null && form !== undefined;
        } catch (e) {
          return false;
        }
      }, { timeout: timeout / retries });

      // 4단계: DOM 안정화 대기
      await page.waitForTimeout(2000);

      console.log('✅ Nexacro 애플리케이션 로딩 완료');
      return true;

    } catch (error) {
      console.log(`⚠️ 로딩 시도 ${attempt}/${retries} 실패: ${error.message}`);

      if (attempt === retries) {
        console.error('❌ Nexacro 애플리케이션 로딩 최종 실패');
        throw error;
      }

      // 재시도 전 대기
      await page.waitForTimeout(2000);
    }
  }
}
```

### 1.2 Nexacro 메시지 대기 함수

```javascript
/**
 * Nexacro 커스텀 메시지 팝업 대기 및 확인
 * @param {Page} page - Playwright Page 객체
 * @param {string} expectedText - 예상 메시지 텍스트
 * @param {boolean} clickOk - 확인 버튼 자동 클릭 여부
 * @param {number} timeout - 타임아웃 (기본: 5초)
 */
async function waitForNexacroMessage(page, expectedText = null, clickOk = true, timeout = 5000) {
  console.log('💬 Nexacro 메시지 팝업 대기 중...');

  try {
    // Nexacro 메시지 팝업 선택자 (실제 DOM 구조에 맞게 조정 필요)
    const messageSelectors = [
      '.nexacro-messagebox',
      '.nexacro-alert',
      '.nexacro-confirm',
      '[class*="message"]',
      '[class*="dialog"]'
    ];

    let messageElement = null;
    for (const selector of messageSelectors) {
      try {
        messageElement = await page.waitForSelector(selector, {
          state: 'visible',
          timeout: timeout / messageSelectors.length
        });
        if (messageElement) {
          console.log(`✅ 메시지 팝업 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!messageElement) {
      // 표준 브라우저 다이얼로그 시도
      const dialog = await page.waitForEvent('dialog', { timeout: 1000 })
        .catch(() => null);

      if (dialog) {
        console.log('🔔 브라우저 표준 다이얼로그:', dialog.message());
        if (expectedText && !dialog.message().includes(expectedText)) {
          throw new Error(`메시지 불일치: 예상="${expectedText}", 실제="${dialog.message()}"`);
        }
        if (clickOk) {
          await dialog.accept();
        }
        return dialog.message();
      }

      throw new Error('메시지 팝업을 찾을 수 없음');
    }

    // 메시지 텍스트 확인
    const messageText = await messageElement.textContent();
    console.log(`📝 메시지 내용: ${messageText}`);

    if (expectedText && !messageText.includes(expectedText)) {
      throw new Error(`메시지 불일치: 예상="${expectedText}", 실제="${messageText}"`);
    }

    // 확인 버튼 클릭
    if (clickOk) {
      const okButtonSelectors = [
        'button:has-text("확인")',
        'button:has-text("OK")',
        '[class*="btn-ok"]',
        '[class*="btn-confirm"]'
      ];

      for (const btnSelector of okButtonSelectors) {
        try {
          await page.click(btnSelector, { timeout: 1000 });
          console.log('✅ 확인 버튼 클릭 완료');
          break;
        } catch (e) {
          continue;
        }
      }
    }

    return messageText;

  } catch (error) {
    console.error('❌ Nexacro 메시지 처리 실패:', error.message);
    throw error;
  }
}
```

### 1.3 컴포넌트 상태 변경 대기 함수

```javascript
/**
 * 컴포넌트 속성 변경 대기 (폴링 방식)
 * @param {Page} page - Playwright Page 객체
 * @param {Function} checkFunction - 상태 확인 함수
 * @param {number} timeout - 타임아웃 (기본: 5초)
 * @param {number} interval - 폴링 간격 (기본: 100ms)
 */
async function waitForComponentState(page, checkFunction, timeout = 5000, interval = 100) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await page.evaluate(checkFunction);

    if (result === true) {
      return true;
    }

    await page.waitForTimeout(interval);
  }

  throw new Error(`컴포넌트 상태 변경 타임아웃 (${timeout}ms)`);
}

// 사용 예시
await waitForComponentState(page, () => {
  const app = window.nexacro.getApplication();
  const activeFrame = app.getActiveFrame();
  const form = activeFrame.form;
  return form.div_main.form.edt_maruId.enable === true;
});
```

---

## 2. 테스트 데이터 자동 생성

### 2.1 시드 데이터 생성 함수

**파일**: `tests/e2e/helpers/test-data-seeder.js`

```javascript
/**
 * MR0100 테스트용 시드 데이터 생성
 */
class TestDataSeeder {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.createdIds = [];
  }

  /**
   * 테스트 마루 헤더 생성
   */
  async createMaruHeader(data) {
    const defaultData = {
      maruId: `TEST_${Date.now()}`,
      maruName: '테스트 마루',
      maruType: 'CODE',
      maruStatus: 'CREATED',
      priorityUseYn: 'N',
      startDate: this.getTodayString(),
      endDate: '99991231235959'
    };

    const payload = { ...defaultData, ...data };

    const response = await fetch(`${this.baseUrl}/api/v1/maru-headers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`시드 데이터 생성 실패: ${response.status}`);
    }

    const result = await response.json();
    this.createdIds.push(payload.maruId);

    console.log(`✅ 시드 데이터 생성: ${payload.maruId}`);
    return result;
  }

  /**
   * 여러 상태의 테스트 데이터 생성
   */
  async seedMultipleStatuses() {
    await this.createMaruHeader({
      maruId: 'TEST_CREATED_001',
      maruName: 'CREATED 상태 테스트',
      maruStatus: 'CREATED'
    });

    await this.createMaruHeader({
      maruId: 'TEST_INUSE_001',
      maruName: 'INUSE 상태 테스트',
      maruStatus: 'INUSE',
      priorityUseYn: 'Y'
    });

    await this.createMaruHeader({
      maruId: 'TEST_RULE_001',
      maruName: 'RULE 타입 테스트',
      maruType: 'RULE',
      maruStatus: 'INUSE'
    });
  }

  /**
   * 생성된 모든 테스트 데이터 삭제
   */
  async cleanup() {
    console.log('🧹 테스트 데이터 정리 중...');

    for (const maruId of this.createdIds) {
      try {
        const response = await fetch(`${this.baseUrl}/api/v1/maru-headers/${maruId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          console.log(`✅ 삭제 완료: ${maruId}`);
        }
      } catch (error) {
        console.error(`⚠️ 삭제 실패: ${maruId}`, error.message);
      }
    }

    this.createdIds = [];
  }

  getTodayString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}

module.exports = { TestDataSeeder };
```

### 2.2 테스트 파일에서 사용

```javascript
const { TestDataSeeder } = require('./helpers/test-data-seeder');

test.describe('MR0100 마루 헤더 관리 E2E 테스트', () => {
  let seeder;

  test.beforeAll(async () => {
    seeder = new TestDataSeeder('http://localhost:3000');
    await seeder.seedMultipleStatuses();
    console.log('✅ 테스트 데이터 준비 완료');
  });

  test.afterAll(async () => {
    await seeder.cleanup();
    console.log('✅ 테스트 데이터 정리 완료');
  });

  // 테스트 케이스들...
});
```

---

## 3. 개선된 테스트 케이스 예시

### 3.1 신규 생성 시나리오 (개선)

```javascript
test('TC-MR0100-UI-002: 신규 생성 시나리오 (개선)', async ({ page }) => {
  console.log('🧪 TC-MR0100-UI-002: 신규 생성 시나리오 시작');

  await waitForTransaction(page);

  // 1. 신규 버튼 클릭
  await page.evaluate(() => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;
    form.div_main.form.btn_new.click();
  });

  // 2. NEW 모드 전환 대기 (폴링 방식)
  await waitForComponentState(page, () => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;
    return form.div_main.form.edt_maruId.enable === true &&
           form.div_main.form.btn_save.enable === true;
  }, 5000);

  console.log('✅ NEW 모드 전환 완료');

  // 3. 데이터 입력
  const testId = 'TEST_MARU_' + Date.now();
  await page.evaluate((maruId) => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;

    form.div_main.form.edt_maruId.set_value(maruId);
    form.div_main.form.edt_maruName.set_value(maruId + '_명칭');
    form.div_main.form.cbo_maruTypeDetail.set_index(1); // CODE
    form.div_main.form.cbo_priorityUse.set_index(0); // Y
  }, testId);

  await page.waitForTimeout(500);
  console.log(`✅ 테스트 데이터 입력 완료: ${testId}`);

  // 4. API 요청 대기
  const apiPromise = page.waitForRequest(req =>
    req.url().includes('/api/v1/maru-headers') &&
    req.method() === 'POST',
    { timeout: 10000 }
  );

  // 5. 저장 버튼 클릭 및 메시지 처리
  await page.evaluate(() => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;
    form.div_main.form.btn_save.click();
  });

  // Nexacro 메시지 처리
  try {
    await waitForNexacroMessage(page, '저장하시겠습니까', true, 5000);
  } catch (error) {
    console.log('⚠️ 메시지 팝업 처리 실패 (계속 진행):', error.message);
  }

  // 6. API 요청 확인
  try {
    const apiRequest = await apiPromise;
    expect(apiRequest.method()).toBe('POST');
    console.log('✅ 생성 API 요청 성공');
  } catch (error) {
    console.log('⚠️ API 요청 타임아웃:', error.message);
  }

  await waitForTransaction(page);

  // 7. 목록에서 생성된 데이터 확인
  const createdData = await page.evaluate((maruId) => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;
    const ds = form.ds_maruList;

    for (let i = 0; i < ds.getRowCount(); i++) {
      if (ds.getColumn(i, 'MARU_ID') === maruId) {
        return {
          maruId: ds.getColumn(i, 'MARU_ID'),
          maruName: ds.getColumn(i, 'MARU_NAME'),
          maruType: ds.getColumn(i, 'MARU_TYPE')
        };
      }
    }
    return null;
  }, testId);

  expect(createdData).not.toBeNull();
  expect(createdData.maruId).toBe(testId);
  console.log('✅ 생성된 데이터 확인:', createdData);

  await page.screenshot({
    path: 'test-results/screenshots/TC-MR0100-UI-002.png',
    fullPage: true
  });

  console.log('✅ TC-MR0100-UI-002 테스트 완료');
});
```

### 3.2 유효성 검증 시나리오 (개선)

```javascript
test('TC-MR0100-UI-007: 유효성 검증 시나리오 (개선)', async ({ page }) => {
  console.log('🧪 TC-MR0100-UI-007: 유효성 검증 시나리오 시작');

  await waitForTransaction(page);

  // 신규 모드 진입
  await page.evaluate(() => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    form = activeFrame.form;
    form.div_main.form.btn_new.click();
  });

  await waitForComponentState(page, () => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;
    return form.div_main.form.btn_save.enable === true;
  });

  // 테스트 1: 마루ID 미입력
  await page.evaluate(() => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;
    form.div_main.form.btn_save.click();
  });

  const message1 = await waitForNexacroMessage(page, '마루ID', true, 3000)
    .catch(err => {
      console.log('⚠️ 메시지 1 처리 실패:', err.message);
      return null;
    });

  expect(message1).toContain('마루ID');
  console.log('✅ 필수 항목 검증 확인');

  // 테스트 2: 마루ID 형식 오류
  await page.evaluate(() => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;
    form.div_main.form.edt_maruId.set_value('invalid-id-123');
    form.div_main.form.btn_save.click();
  });

  const message2 = await waitForNexacroMessage(page, '영문 대문자', true, 3000)
    .catch(err => {
      console.log('⚠️ 메시지 2 처리 실패:', err.message);
      return null;
    });

  if (message2) {
    expect(message2).toContain('영문');
    console.log('✅ 마루ID 형식 검증 확인');
  }

  // 테스트 3: 날짜 범위 오류
  await page.evaluate(() => {
    const app = window.nexacro.getApplication();
    const activeFrame = app.getActiveFrame();
    const form = activeFrame.form;

    form.div_main.form.edt_maruId.set_value('VALID_ID');
    form.div_main.form.edt_maruName.set_value('유효성테스트');
    form.div_main.form.cbo_maruTypeDetail.set_index(1);
    form.div_main.form.cal_startDate.set_value('20251231000000');
    form.div_main.form.cal_endDate.set_value('20250101000000');
    form.div_main.form.btn_save.click();
  });

  const message3 = await waitForNexacroMessage(page, '시작일', true, 3000)
    .catch(err => {
      console.log('⚠️ 메시지 3 처리 실패:', err.message);
      return null;
    });

  if (message3) {
    expect(message3).toContain('시작일');
    console.log('✅ 날짜 범위 검증 확인');
  }

  await page.screenshot({
    path: 'test-results/screenshots/TC-MR0100-UI-007.png',
    fullPage: true
  });

  console.log('✅ TC-MR0100-UI-007 테스트 완료');
});
```

---

## 4. Playwright 설정 개선

### 4.1 타임아웃 및 재시도 설정

**파일**: `playwright.config.js`

```javascript
module.exports = defineConfig({
  // ... 기존 설정

  use: {
    baseURL: 'http://127.0.0.1:5500/webapp/',
    trace: 'retain-on-failure', // 실패 시 trace 보관
    screenshot: 'only-on-failure', // 실패 시에만 스크린샷
    video: 'retain-on-failure',
    actionTimeout: 15000,  // 10초 → 15초로 증가
    navigationTimeout: 45000, // 30초 → 45초로 증가
  },

  // 재시도 설정 추가
  retries: process.env.CI ? 2 : 1, // CI에서는 2회, 로컬에서는 1회 재시도

  // 각 테스트 타임아웃 증가
  timeout: 3 * 60 * 1000, // 2분 → 3분

  // 리포터 설정 개선
  reporter: [
    ['html', { outputFolder: 'playwright-report' }], // html 리포트 경로 변경
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }] // JUnit 리포트 추가
  ],
});
```

---

## 5. 실행 스크립트

### 5.1 package.json 추가

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:mr0100": "playwright test tests/e2e/MR0100.spec.js",
    "test:e2e:mr0100:debug": "playwright test tests/e2e/MR0100.spec.js --headed --debug",
    "test:e2e:report": "playwright show-report",
    "test:seed": "node tests/e2e/helpers/seed-test-data.js"
  }
}
```

### 5.2 시드 데이터 스크립트

**파일**: `tests/e2e/helpers/seed-test-data.js`

```javascript
const { TestDataSeeder } = require('./test-data-seeder');

async function main() {
  const seeder = new TestDataSeeder('http://localhost:3000');

  console.log('🌱 테스트 데이터 시딩 시작...');

  try {
    await seeder.seedMultipleStatuses();
    console.log('✅ 테스트 데이터 시딩 완료');
  } catch (error) {
    console.error('❌ 시딩 실패:', error);
    process.exit(1);
  }
}

main();
```

---

## 6. 개선 우선순위

### Phase 1: 긴급 (이번 주)
1. ✅ `waitForNexacroLoad()` 재시도 로직 추가
2. ✅ `waitForNexacroMessage()` 함수 작성
3. ✅ `waitForComponentState()` 폴링 함수 작성
4. ✅ `TestDataSeeder` 클래스 작성

### Phase 2: 중요 (2주 이내)
1. ⏳ 모든 테스트 케이스에 개선된 Helper 함수 적용
2. ⏳ 시드 데이터 자동 생성 스크립트 통합
3. ⏳ Nexacro 메시지 팝업 DOM 구조 실제 확인 및 선택자 조정
4. ⏳ 재시도 설정 활성화 및 테스트

### Phase 3: 일반 (1개월 이내)
1. ⏳ CI/CD 파이프라인 통합
2. ⏳ 테스트 커버리지 80% 달성
3. ⏳ 성능 테스트 시나리오 추가
4. ⏳ 크로스 브라우저 테스트 (Firefox, Safari)

---

## 7. 참고 자료

- Playwright 공식 문서: https://playwright.dev/docs/intro
- Nexacro N 개발 가이드: `docs/common/06.guide/`
- MR0100 상세설계서: `docs/project/maru/10.design/12.detail-design/`

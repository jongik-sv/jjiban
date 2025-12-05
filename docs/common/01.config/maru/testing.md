# MARU 프로젝트 테스트 설정

## E2E 테스트 프레임워크
**Playwright**

## 설정 파일
```yaml
config_file: "playwright.config.js"
base_url: "http://127.0.0.1:5500/webapp/"
test_dir: "./tests/e2e/"
```

## Nexacro 전용 테스트 패턴

### 화면 로드 대기
```javascript
// nexacro.Application 확인
await waitForNexacroLoad()
```

### Dataset 조작
```javascript
// Dataset 행 수 확인
const rowCount = await getDatasetRowCount()

// Dataset 데이터 검증
await validateDatasetData()
```

### Grid 상호작용
```javascript
// Grid 셀 클릭 및 선택
await clickGridCell(row, col)
```

### Transaction 처리
```javascript
// 비동기 처리 완료 대기
await waitForTransaction()
```

### 컴포넌트 선택
```javascript
// data-testid 속성 기반 선택자 사용 권장
await page.locator('[data-testid="btnSave"]').click()
```

## 테스트 시나리오 유형

### 1. 기본 시나리오
화면 로드 → 데이터 조회 → 결과 검증

### 2. CRUD 시나리오
등록 → 수정 → 삭제 → 이력 확인

### 3. 통합 시나리오
여러 화면 연계 테스트 (메뉴 이동, 데이터 연동)

### 4. 단위 기능 시나리오
quickview.html을 이용한 개별 Form 테스트

## 실행 명령어

### 전체 E2E 테스트
```bash
npm run test:e2e
```

### 특정 테스트 파일 실행
```bash
npx playwright test [파일명]
```

### 헤드리스 모드
```bash
npx playwright test --headless
```

### 테스트 결과 리포트
```bash
npx playwright show-report
```

## 환경 준비 체크리스트
- [ ] nexacrodeploy.exe로 소스 컴파일 완료
- [ ] Live Server로 webapp 실행 (포트 5500)
- [ ] Backend 서버 실행 (포트 3000)
- [ ] 데이터베이스 연결 확인
- [ ] Playwright 테스트 환경 설정

## 테스트 결과 저장 위치
```
docs/project/maru/50.test/51.e2e-test-results/
└── {task-id}_{task-name}/
    └── {timestamp}/
        ├── html/index.html          # HTML 테스트 리포트
        ├── results.json             # JSON 형식 테스트 결과
        ├── junit.xml                # JUnit 형식 테스트 결과
        └── screenshots/             # 시나리오별 스크린샷
```

## 타임스탬프 형식
**형식**: `YYYY-MM-DDTHH-mm-ss` (대한민국 KST 기준, 파일 시스템 호환)
**예시**: `2025-10-02T10-29-11` (KST, UTC+9)
**생성 방법**: `Asia/Seoul` 시간대로 명시적 변환하여 정확한 로컬 시간 보장

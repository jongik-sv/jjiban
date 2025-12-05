# run_e2e_test() - E2E 테스트 실행 공통 함수

## 목적
프로젝트별 테스트 설정을 참조하여 E2E 테스트를 실행하고 결과를 저장합니다.

## 사용법

### 명령어에서 참조
```markdown
**E2E 테스트 실행**:
- 📋 함수 참조: `@docs/common/07.functions/run_e2e_test.md`
- 테스트 설정: `@docs/common/01.config/{project}/testing.md`
```

### 호출 방법
```javascript
run_e2e_test(project_name, task_id, test_file)
```

## 실행 로직

### 1단계: 환경 준비
```javascript
// setup_e2e_test() 호출
const env = await setup_e2e_test(project_name, task_id)
```

### 2단계: Task 정보 추출
```javascript
// Task 이름 가져오기
const taskName = await getTaskName(taskId)
const folderName = `${taskId}_${taskName}`
```

### 3단계: 타임스탬프 생성 (KST)
```javascript
// 대한민국 시간 (KST, UTC+9)
const now = new Date()
const kstTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
const timestamp = formatTimestamp(kstTime) // YYYY-MM-DDTHH-mm-ss
```

### 4단계: 출력 디렉토리 설정
```javascript
const outputDir = `./docs/project/${project}/50.test/51.e2e-test-results/${folderName}/${timestamp}`
```

### 5단계: Playwright 실행
```javascript
// 환경변수 설정
process.env.TEST_OUTPUT_DIR = outputDir
process.env.TASK_ID = taskId

// Playwright 실행
if (test_file) {
  await exec(`npx playwright test ${test_file}`)
} else {
  await exec(`npx playwright test --grep "@${taskId}"`)
}
```

### 6단계: 결과 저장
- HTML 리포트: `{outputDir}/html/index.html`
- JSON 결과: `{outputDir}/results.json`
- JUnit XML: `{outputDir}/junit.xml`
- 스크린샷: `{outputDir}/screenshots/`

## 입력 파라미터
- **project_name** (필수): 프로젝트명 (예: "maru")
- **task_id** (필수): Task ID (예: "Task-3-1", "3.1")
- **test_file** (선택): 특정 테스트 파일 경로

## 출력 결과
```json
{
  "taskId": "Task-3-1",
  "taskName": "마루헤더관리",
  "folderName": "Task-3-1_마루헤더관리",
  "timestamp": "2025-10-02T10-29-11",
  "outputDir": "./docs/project/maru/50.test/51.e2e-test-results/Task-3-1_마루헤더관리/2025-10-02T10-29-11",
  "summary": {
    "total": 10,
    "passed": 9,
    "failed": 1,
    "skipped": 0,
    "passRate": "90%"
  },
  "reports": {
    "html": "./docs/.../html/index.html",
    "json": "./docs/.../results.json"
  },
  "status": "success"
}
```

## 테스트 결과 구조
```
docs/project/{project}/50.test/51.e2e-test-results/
└── {task-id}_{task-name}/
    └── {timestamp}/
        ├── html/
        │   └── index.html          # HTML 테스트 리포트
        ├── results.json            # JSON 형식 테스트 결과
        ├── junit.xml               # JUnit 형식 테스트 결과
        └── screenshots/            # 시나리오별 스크린샷
```

## 타임스탬프 형식
- **형식**: `YYYY-MM-DDTHH-mm-ss` (파일 시스템 호환)
- **시간대**: 대한민국 KST (Asia/Seoul, UTC+9)
- **예시**: `2025-10-02T10-29-11`

## 에러 처리

### 환경 준비 실패
```
❌ 테스트 환경 준비 실패
setup_e2e_test() 결과를 확인하세요.
```

### 테스트 실패
```
⚠️ 테스트 실패: {failed}개 케이스
상세 내용은 HTML 리포트를 확인하세요:
{outputDir}/html/index.html
```

## 품질 기준
- ✅ 주요 사용자 시나리오 E2E 테스트 100% 통과
- ✅ Backend-Frontend 연동 정상 동작
- ✅ 화면 설계 요구사항 충족
- ✅ 테스트 결과가 Task별로 체계적으로 저장됨
- ✅ 타임스탬프 기반 테스트 이력 관리

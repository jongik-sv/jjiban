---
name: qa:e2e_test
description: "Playwright E2E 테스트 실행 및 결과 저장"
category: testing
complexity: moderate
wave-enabled: true
personas: [frontend-developer, quality-engineer]
mcp-servers: [playwright, sequential]
---

# /qa:e2e_test - E2E 테스트 실행

> Frontend 화면에 대한 Playwright E2E 테스트를 실행하고 결과를 Task별로 저장합니다.

## 🎯 목적
- Playwright를 이용한 E2E 테스트 자동 실행
- Task별 테스트 결과 체계적 저장
- 타임스탬프 기반 테스트 이력 관리
- 테스트 결과 리포트 자동 생성

## 사용법
```bash
# Task 번호로 실행
/qa:e2e_test Task-3-1
/qa:e2e_test 3.2

# 특정 테스트 파일 실행
/qa:e2e_test Task-3-1 tests/e2e/MR0100.spec.js
```

## 입력 파라미터
- **task_id** (필수): Task 번호 (예: "3.1", "Task-3-2")
- **test_file** (선택): 특정 테스트 파일 경로

## Task 이름 추출
Task 이름은 다음 위치에서 자동 추출:
1. **WBS 문서**: `./docs/project/maru/00.foundation/01.project-charter/tasks.md`
2. **설계 문서**: `./docs/project/maru/20.design/{task-id}/` 폴더의 화면 설계서
3. **기본값**: Task 이름을 찾을 수 없는 경우 `Task-{id}` 형식 유지

## ⚠️ 사전 검증 (Pre-execution Validation)

**실행 전 필수 체크**:
이 명령어를 실행하기 전에 다음 파일들의 존재 여부를 **반드시** 확인하세요:

### 공통 함수 (필수)
- [ ] `@docs/common/07.functions/compile_frontend.md`
- [ ] `@docs/common/07.functions/setup_e2e_test.md`
- [ ] `@docs/common/07.functions/run_e2e_test.md`

### 프로젝트 설정 (필수)
- [ ] `@docs/common/01.config/{project}/frontend.md`
- [ ] `@docs/common/01.config/{project}/testing.md`

**검증 절차**:
1. 각 파일에 대해 Read 도구를 사용하여 존재 확인
2. **파일이 존재하지 않으면 아래 에러 메시지 출력 후 즉시 중단**
3. 모든 파일이 존재하는 경우에만 명령어 실행 진행

**검증 실패 시 에러 메시지**:
```
❌ 명령어 실행 중단

필수 파일이 존재하지 않습니다:
- {missing_file_path}

조치 방법:
1. 파일이 올바른 위치에 있는지 확인하세요
2. 누락된 파일을 생성하거나 복원하세요
3. 파일 경로가 정확한지 확인하세요

명령어 실행을 중단합니다.
```

## 자동 실행 단계

### 1단계: 환경 준비 및 검증
**Auto-Persona**: frontend-developer

1. **Task 정보 파싱**:
   ```javascript
   function parseTaskId(input) {
       const taskPattern = /(?:Task[-_])?(\d+[-_.]\d+)/i;
       const match = input.match(taskPattern);
       return match ? `Task-${match[1].replace(/[_.]/g, '-')}` : null;
   }
   ```

2. **환경 설정 및 확인**:
   - 📋 함수 참조: `@docs/common/07.functions/setup_e2e_test.md`
   - 프로젝트 설정: `@docs/common/01.config/{project}/testing.md`
   - Backend 서버 실행 확인 (포트 3000)
   - Frontend 개발 서버 실행 확인 (포트 5500)
   - 서버 미실행시 자동 시작 또는 사용자 안내

3. **Frontend 소스 컴파일** (필요시):
   - 📋 함수 참조: `@docs/common/07.functions/compile_frontend.md`
   - 프로젝트 설정: `@docs/common/01.config/{project}/frontend.md`
   - 프레임워크별 컴파일 명령 자동 실행

### 2단계: 테스트 설정 및 실행
**Auto-Persona**: quality-engineer
**MCP**: playwright + sequential

1. **테스트 실행**:
   - 📋 함수 참조: `@docs/common/07.functions/run_e2e_test.md`
   - 테스트 설정: `@docs/common/01.config/{project}/testing.md`

2. **테스트 경로 설정**:
   ```javascript
   const taskId = parseTaskId(input); // "Task-3-1"

   // Task 이름 가져오기 (WBS 또는 설계 문서에서)
   const taskName = await getTaskName(taskId); // 예: "마루헤더관리"
   const folderName = `${taskId}_${taskName}`; // "Task-3-1_마루헤더관리"

   // 확실한 로컬 시간(대한민국 KST) 타임스탬프 생성
   const now = new Date();
   // toLocaleString을 사용하여 명시적으로 한국 시간대 지정
   const kstTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
   const year = kstTime.getFullYear();
   const month = String(kstTime.getMonth() + 1).padStart(2, '0');
   const day = String(kstTime.getDate()).padStart(2, '0');
   const hour = String(kstTime.getHours()).padStart(2, '0');
   const minute = String(kstTime.getMinutes()).padStart(2, '0');
   const second = String(kstTime.getSeconds()).padStart(2, '0');
   const timestamp = `${year}-${month}-${day}T${hour}-${minute}-${second}`;
   const outputDir = `./docs/project/maru/50.test/51.e2e-test-results/${folderName}/${timestamp}`;
   ```

2. **Playwright 설정 구성**:
   ```javascript
   // playwright.config.js 동적 설정 또는 환경변수 사용
   process.env.TEST_OUTPUT_DIR = outputDir;
   process.env.TASK_ID = taskId;

   reporter: [
     ['html', {
       outputFolder: `${outputDir}/html`,
       open: 'never'
     }],
     ['json', { outputFile: `${outputDir}/results.json` }],
     ['junit', { outputFile: `${outputDir}/junit.xml` }]
   ]
   ```

3. **E2E 테스트 실행**:
   ```bash
   # 전체 Task 테스트 실행
   npx playwright test --grep "@${taskId}"

   # 또는 특정 테스트 파일 실행
   npx playwright test ${test_file}
   ```

4. **실행 중 작업**:
   - 사용자 시나리오 자동 검증
   - Backend-Frontend 연동 확인
   - 각 시나리오별 스크린샷 자동 캡처
   - 테스트 실행 메타데이터 기록

### 3단계: 결과 저장 및 검증
**Auto-Persona**: quality-engineer

1. **테스트 결과 저장**:
   - HTML 리포트: `{task-id}_{task-name}/{timestamp}/html/index.html`
   - JSON 결과: `{task-id}_{task-name}/{timestamp}/results.json`
   - JUnit XML: `{task-id}_{task-name}/{timestamp}/junit.xml`
   - 스크린샷: `{task-id}_{task-name}/{timestamp}/screenshots/`

2. **결과 분석**:
   - 전체 테스트 수 및 통과율 계산
   - 실패한 테스트 케이스 목록 정리
   - 주요 에러 메시지 추출

3. **품질 검증**:
   - 주요 시나리오 100% 통과 확인
   - Backend-Frontend 연동 정상 동작 확인
   - 화면 설계 요구사항 충족 확인

4. **재테스트 처리** (실패 케이스 발견시):
   - 발견된 이슈 수정
   - 재테스트 실행
   - 새로운 타임스탬프로 결과 저장

## 산출물

### 테스트 결과 구조
```
docs/project/maru/50.test/51.e2e-test-results/
└── {task-id}_{task-name}/
    └── {timestamp}/
        ├── html/
        │   └── index.html          # HTML 테스트 리포트
        ├── results.json            # JSON 형식 테스트 결과
        ├── junit.xml               # JUnit 형식 테스트 결과
        └── screenshots/            # 시나리오별 스크린샷
            ├── scenario-1.png
            ├── scenario-2.png
            └── ...

예시:
docs/project/maru/50.test/51.e2e-test-results/
└── Task-3-1_마루헤더관리/
    └── 2025-10-02T10-29-11/
        ├── html/
        ├── results.json
        └── screenshots/
```

### 반환 정보
명령어 실행 후 다음 정보를 반환 (타임스탬프는 대한민국 KST 기준):
```json
{
  "taskId": "Task-3-1",
  "taskName": "마루헤더관리",
  "folderName": "Task-3-1_마루헤더관리",
  "timestamp": "2025-10-02T10-29-11",  // 대한민국 시간 (KST, UTC+9)
  "outputDir": "./docs/project/maru/50.test/51.e2e-test-results/Task-3-1_마루헤더관리/2025-10-02T10-29-11",
  "summary": {
    "total": 10,
    "passed": 9,
    "failed": 1,
    "skipped": 0,
    "passRate": "90%"
  },
  "reports": {
    "html": "./docs/project/maru/50.test/51.e2e-test-results/Task-3-1_마루헤더관리/2025-10-02T10-29-11/html/index.html",
    "json": "./docs/project/maru/50.test/51.e2e-test-results/Task-3-1_마루헤더관리/2025-10-02T10-29-11/results.json"
  },
  "status": "success" | "failed" | "partial"
}
```

## 품질 기준
- ✅ 주요 사용자 시나리오 E2E 테스트 100% 통과
- ✅ Backend-Frontend 연동 정상 동작
- ✅ 화면 설계 요구사항 충족
- ✅ 테스트 결과가 Task별로 체계적으로 저장됨
- ✅ 타임스탬프 기반 테스트 이력 관리

## 타임스탬프 형식
**형식**: `YYYY-MM-DDTHH-mm-ss` (대한민국 KST 기준, 파일 시스템 호환)
**예시**: `2025-01-15T14-30-00` (KST, UTC+9)
**설명**: `Asia/Seoul` 시간대로 명시적 변환하여 정확한 로컬 시간 보장

## 사용 예시

### 독립 실행
```bash
# Task 3.1의 E2E 테스트 실행
/qa:e2e_test Task-3-1
# 결과: ./docs/project/maru/50.test/51.e2e-test-results/Task-3-1_마루헤더관리/2025-10-02T10-29-11/

# 특정 화면 테스트 실행
/qa:e2e_test 3.2 tests/e2e/MR0200.spec.js
# 결과: ./docs/project/maru/50.test/51.e2e-test-results/Task-3-2_코드카테고리관리/2025-10-02T14-15-30/
```

### dev:implement에서 호출
```markdown
# dev:implement 3단계에서 자동 호출
SlashCommand: /qa:e2e_test ${task_number}
```

---

**연관 명령어**:
- `/dev:implement` - 이 명령어를 3단계에서 호출
- `/qa:integration` - 통합 테스트 케이스 작성
